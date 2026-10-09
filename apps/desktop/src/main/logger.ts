import { appendFileSync, existsSync, mkdirSync, renameSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { redact, type Logger } from '@advertex/core';

const MAX_BYTES = 5 * 1024 * 1024;
const KEEP = 3;

/**
 * Logs estruturados (JSON por linha) em %APPDATA%/ADVERTEX AI Studio/logs,
 * com rotação por tamanho e redação automática de segredos.
 */
export function createFileLogger(dir: string, opts: { console?: boolean } = {}): Logger & { file: string } {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, 'main.log');

  const rotate = () => {
    if (!existsSync(file) || statSync(file).size < MAX_BYTES) return;
    const oldest = `${file}.${KEEP}`;
    if (existsSync(oldest)) unlinkSync(oldest);
    for (let i = KEEP - 1; i >= 1; i -= 1) {
      if (existsSync(`${file}.${i}`)) renameSync(`${file}.${i}`, `${file}.${i + 1}`);
    }
    renameSync(file, `${file}.1`);
  };

  const write = (level: string, msg: string, meta?: Record<string, unknown>) => {
    const entry = { ts: new Date().toISOString(), level, msg, ...(meta ? (redact(meta) as Record<string, unknown>) : {}) };
    const line = JSON.stringify(entry);
    try {
      rotate();
      appendFileSync(file, `${line}\n`, 'utf8');
    } catch {
      // Falha ao gravar log não pode derrubar o app.
    }
    if (opts.console) (level === 'error' ? console.error : console.warn)(line);
  };

  return {
    file,
    debug: (m, meta) => write('debug', m, meta),
    info: (m, meta) => write('info', m, meta),
    warn: (m, meta) => write('warn', m, meta),
    error: (m, meta) => write('error', m, meta),
  };
}
