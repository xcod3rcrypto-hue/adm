import { createReadStream, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Readable } from 'node:stream';
import { BrowserWindow, Menu, app, dialog, net, protocol, safeStorage, session, shell, type IpcMainInvokeEvent } from 'electron';
import { AnthropicProvider } from '@advertex/ai-core';
import { Database, defaultIds, resolveAssetFile, runDueAutomations, runDueAutopilots, type AppContext, type SecretCipher } from '@advertex/core';
import { createFileLogger } from './logger';
import { registerIpc } from './ipc';
import { createHandlers, isAllowedExternal } from './handlers';
import { Updater } from './updater';

const APP_NAME = 'ADVERTEX AI Studio';
app.setName(APP_NAME);
// Permite isolar os dados em testes automatizados (E2E) sem tocar no perfil real.
if (process.env.ADVERTEX_USER_DATA) app.setPath('userData', process.env.ADVERTEX_USER_DATA);
if (process.platform === 'win32') app.setAppUserModelId('com.advertex.aistudio');

const userData = app.getPath('userData');
const paths = {
  userData,
  logs: join(userData, 'logs'),
  database: join(userData, 'data', 'advertex.sqlite'),
  assets: join(userData, 'assets'),
};
const logger = createFileLogger(paths.logs, { console: !app.isPackaged });

process.on('uncaughtException', (err) => logger.error('uncaughtException', { error: err }));
process.on('unhandledRejection', (reason) => logger.error('unhandledRejection', { error: reason instanceof Error ? reason : String(reason) }));

// Esquema interno para servir ativos ao renderer sem expor caminhos do disco.
protocol.registerSchemesAsPrivileged([{ scheme: 'advertex-asset', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let db: Database | null = null;

const cipher: SecretCipher = {
  isAvailable: () => safeStorage.isEncryptionAvailable(),
  encrypt: (plain) => new Uint8Array(safeStorage.encryptString(plain)),
  decrypt: (data) => safeStorage.decryptString(Buffer.from(data)),
};

function rendererUrl(): string | null {
  return !app.isPackaged && process.env.ELECTRON_RENDERER_URL ? process.env.ELECTRON_RENDERER_URL : null;
}

const rendererDirUrl = pathToFileURL(join(__dirname, '../renderer/')).href;

function isTrustedUrl(url: string): boolean {
  const dev = rendererUrl();
  if (dev) return url.startsWith(dev);
  return url.startsWith(rendererDirUrl);
}

function isTrustedSender(e: IpcMainInvokeEvent): boolean {
  return !!e.senderFrame && isTrustedUrl(e.senderFrame.url) && mainWindow !== null && e.sender.id === mainWindow.webContents.id;
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    title: APP_NAME,
    backgroundColor: '#0b0d12',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: true,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Bloqueia navegação e janelas novas; links permitidos abrem no navegador do sistema.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternal(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isTrustedUrl(url)) event.preventDefault();
  });
  mainWindow.webContents.on('render-process-gone', (_e, details) => logger.error('renderer.gone', { reason: details.reason, exitCode: details.exitCode }));

  const dev = rendererUrl();
  if (dev) void mainWindow.loadURL(dev);
  else void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
}

async function bootstrap(): Promise<void> {
  logger.info('app.start', { version: app.getVersion(), packaged: app.isPackaged, electron: process.versions.electron });
  mkdirSync(paths.assets, { recursive: true });

  // sql.js é dependência de produção: o .wasm é lido de node_modules (inclusive dentro do app.asar).
  const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
  db = await Database.open(paths.database, wasmPath);
  logger.info('db.open', { schemaVersion: db.schemaVersion });

  const ctx: AppContext = {
    db,
    cipher,
    logger,
    fetch: (url, init) => net.fetch(url, init),
    ...defaultIds,
    assetsDir: paths.assets,
    createTextProvider: ({ model, apiKey }) => new AnthropicProvider({ apiKey, model }),
    openExternal: async (url) => {
      await shell.openExternal(url);
    },
  };

  // Nega permissões sensíveis (câmera, microfone, geolocalização, notificações etc.).
  // Única exceção: escrita na área de transferência (botão "Copiar").
  const allowedPermission = (perm: string) => perm === 'clipboard-sanitized-write';
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(allowedPermission(perm)));
  session.defaultSession.setPermissionCheckHandler((_wc, perm) => allowedPermission(perm));

  protocol.handle('advertex-asset', (request) => {
    const id = new URL(request.url).hostname;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('Bad request', { status: 400 });
    const file = resolveAssetFile(ctx, id);
    if (!file) return new Response('Not found', { status: 404 });
    const stream = Readable.toWeb(createReadStream(file.path)) as ReadableStream;
    return new Response(stream, { headers: { 'Content-Type': file.mime, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, max-age=3600' } });
  });

  const updater = new Updater(logger);
  registerIpc(ctx, createHandlers({ userData: paths.userData, logs: paths.logs, database: paths.database }, updater), isTrustedSender);
  updater.start();
  startAutomationScheduler(ctx);
  Menu.setApplicationMenu(null);
  createWindow();
}

let automationTimer: NodeJS.Timeout | null = null;
let automationRunning = false;

/** Avalia regras de automação vencidas a cada 5 minutos enquanto o app está aberto. */
function startAutomationScheduler(ctx: AppContext): void {
  const tick = () => {
    if (automationRunning) return;
    automationRunning = true;
    runDueAutomations({ ...ctx, correlationId: `scheduler-${Date.now()}` })
      .then((n) => n > 0 && logger.info('automation.scheduler', { rulesRun: n }))
      // Piloto automático: rotina diária só para quem ligou nas configurações do piloto.
      .then(() => runDueAutopilots({ ...ctx, correlationId: `autopilot-${Date.now()}` }))
      .then((n) => n && n > 0 && logger.info('autopilot.scheduler', { organizations: n }))
      .catch((err: unknown) => logger.error('automation.scheduler.failed', { error: err instanceof Error ? err : String(err) }))
      .finally(() => {
        automationRunning = false;
      });
  };
  setTimeout(tick, 30_000);
  automationTimer = setInterval(tick, 5 * 60_000);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  if (automationTimer) clearInterval(automationTimer);
  try {
    db?.close();
    logger.info('app.quit');
  } catch (err) {
    logger.error('db.close', { error: err instanceof Error ? err : String(err) });
  }
});

app.whenReady()
  .then(bootstrap)
  .catch((err: unknown) => {
    logger.error('bootstrap.failed', { error: err instanceof Error ? err : String(err) });
    dialog.showErrorBox(APP_NAME, `Não foi possível iniciar o aplicativo.\n\nDetalhes em: ${logger.file}`);
    app.exit(1);
  });
