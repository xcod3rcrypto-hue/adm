import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { TextProvider } from '@advertex/ai-core';
import type { FetchLike } from '@advertex/advertising-core';
import { Database } from './db/database';
import { silentLogger, type AppContext, type SecretCipher } from './context';

/** Cifra reversível SOMENTE para testes (simula DPAPI). */
export const fakeCipher = (available = true): SecretCipher => ({
  isAvailable: () => available,
  encrypt: (s) => new Uint8Array(Buffer.from(`enc:${Buffer.from(s).toString('base64')}`)),
  decrypt: (b) => Buffer.from(Buffer.from(b).toString().slice(4), 'base64').toString(),
});

export async function makeTestContext(overrides: Partial<AppContext> = {}): Promise<AppContext> {
  const db = await Database.open(null);
  let n = 0;
  let clock = Date.parse('2026-10-01T12:00:00.000Z');
  return {
    db,
    cipher: fakeCipher(),
    logger: silentLogger,
    fetch: (async () => {
      throw new Error('fetch não mockado');
    }) as FetchLike,
    now: () => new Date((clock += 1000)).toISOString(),
    newId: () => {
      n += 1;
      return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
    },
    assetsDir: mkdtempSync(join(tmpdir(), 'advertex-assets-')),
    createTextProvider: () => {
      throw new Error('provider não mockado');
    },
    openExternal: async () => {},
    ...overrides,
  };
}

export function fakeProvider(impl: Partial<TextProvider>): TextProvider {
  return {
    id: 'fake',
    model: 'fake-model',
    generateStructured: async () => {
      throw new Error('não implementado');
    },
    ping: async () => ({ model: 'fake-model', reply: 'conectado' }),
    ...impl,
  } as TextProvider;
}

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}
