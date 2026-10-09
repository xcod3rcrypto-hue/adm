import { randomUUID } from 'node:crypto';
import type { FetchLike } from '@advertex/advertising-core';
import type { TextProvider } from '@advertex/ai-core';
import type { Database } from './db/database';

/** Criptografia de segredos fornecida pelo host (Electron safeStorage/DPAPI no Windows). */
export interface SecretCipher {
  isAvailable(): boolean;
  encrypt(plain: string): Uint8Array;
  decrypt(cipher: Uint8Array): string;
}

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

export interface AppContext {
  db: Database;
  cipher: SecretCipher;
  logger: Logger;
  fetch: FetchLike;
  now: () => string;
  newId: () => string;
  /** Diretório onde arquivos de ativos são guardados. */
  assetsDir: string;
  /** Cria o provedor de IA a partir da configuração salva (injetável em testes). */
  createTextProvider: (cfg: { provider: string; model: string; apiKey: string }) => TextProvider;
  /** Abre uma URL no navegador do sistema (fluxo OAuth). */
  openExternal: (url: string) => Promise<void>;
  /** ID de correlação da operação atual (logs/auditoria). */
  correlationId?: string;
}

export const silentLogger: Logger = { debug() {}, info() {}, warn() {}, error() {} };

export const defaultIds = { now: () => new Date().toISOString(), newId: () => randomUUID() };
