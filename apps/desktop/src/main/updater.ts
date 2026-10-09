import { app } from 'electron';
import { autoUpdater, type ProgressInfo, type UpdateInfo } from 'electron-updater';
import type { UpdateState } from '@advertex/shared';
import type { Logger } from '@advertex/core';

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000;

/**
 * Atualização automática pelas Releases do GitHub (electron-updater).
 * O app só verifica e avisa: o download começa quando o usuário clica em
 * "Atualizar", e a instalação acontece ao reiniciar (ou ao fechar o app).
 * Em desenvolvimento (app não empacotado) fica desativado.
 */
export class Updater {
  private state: UpdateState;

  constructor(private readonly logger: Logger) {
    this.state = { status: app.isPackaged ? 'idle' : 'disabled', currentVersion: app.getVersion(), availableVersion: null, progress: null, error: null, checkedAt: null };
    if (!app.isPackaged) return;

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.logger = null;

    autoUpdater.on('checking-for-update', () => this.set({ status: 'checking', error: null }));
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.logger.info('update.available', { version: info.version });
      this.set({ status: 'available', availableVersion: info.version, checkedAt: new Date().toISOString() });
    });
    autoUpdater.on('update-not-available', () => this.set({ status: 'up-to-date', availableVersion: null, checkedAt: new Date().toISOString() }));
    autoUpdater.on('download-progress', (p: ProgressInfo) => this.set({ status: 'downloading', progress: Math.round(p.percent) }));
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      this.logger.info('update.downloaded', { version: info.version });
      this.set({ status: 'downloaded', availableVersion: info.version, progress: 100 });
    });
    autoUpdater.on('error', (err: Error) => {
      this.logger.warn('update.error', { error: err.message });
      // Sem internet ou sem release publicada: não é um erro para o usuário resolver.
      this.set({ status: this.state.status === 'downloading' ? 'available' : 'idle', error: friendly(err) });
    });
  }

  start(): void {
    if (this.state.status === 'disabled') return;
    setTimeout(() => void this.check(), 15_000);
    setInterval(() => void this.check(), CHECK_INTERVAL_MS);
  }

  getState(): UpdateState {
    return { ...this.state };
  }

  async check(): Promise<UpdateState> {
    if (this.state.status === 'disabled' || this.state.status === 'downloading' || this.state.status === 'downloaded') return this.getState();
    try {
      await autoUpdater.checkForUpdates();
    } catch {
      // O evento 'error' já atualizou o estado.
    }
    return this.getState();
  }

  async download(): Promise<UpdateState> {
    if (this.state.status !== 'available') return this.getState();
    this.set({ status: 'downloading', progress: 0, error: null });
    autoUpdater.downloadUpdate().catch(() => undefined);
    return this.getState();
  }

  install(): void {
    if (this.state.status !== 'downloaded') return;
    this.logger.info('update.install', { version: this.state.availableVersion });
    // isSilent=true: instala sem assistente; isForceRunAfter=true: reabre o app.
    setImmediate(() => autoUpdater.quitAndInstall(true, true));
  }

  private set(patch: Partial<UpdateState>): void {
    this.state = { ...this.state, ...patch };
  }
}

function friendly(err: Error): string {
  const m = err.message;
  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|net::ERR/i.test(m)) return 'Sem conexão com o servidor de atualizações. Tente novamente mais tarde.';
  if (/404|Cannot find latest|No published versions/i.test(m)) return 'Nenhuma versão publicada para atualização ainda.';
  return 'Não foi possível verificar atualizações agora.';
}
