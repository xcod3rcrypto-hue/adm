import type { AppContext } from '../context';
import { parseJson } from '../util';

export function getSetting<T>(ctx: AppContext, key: string, fallback: T): T {
  const row = ctx.db.get<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? parseJson<T>(row.value, fallback) : fallback;
}

export function setSetting(ctx: AppContext, key: string, value: unknown): void {
  ctx.db.run(
    'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
    [key, JSON.stringify(value), ctx.now()],
  );
}
