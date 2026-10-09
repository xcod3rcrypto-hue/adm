import { AppError } from '@advertex/shared';
import type { AppContext } from '../context';

/**
 * Segredos ficam somente no processo principal, cifrados pelo sistema
 * operacional (DPAPI no Windows via safeStorage). Nunca retornam ao renderer.
 */
export function putSecret(ctx: AppContext, scope: string, organizationId: string | null, plain: string): void {
  if (!ctx.cipher.isAvailable()) {
    throw new AppError('NOT_CONFIGURED', 'Armazenamento seguro do sistema indisponível; a credencial não foi salva.');
  }
  const cipher = ctx.cipher.encrypt(plain);
  const now = ctx.now();
  ctx.db.run(
    `INSERT INTO secrets (scope, organization_id, ciphertext, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(scope) DO UPDATE SET ciphertext = excluded.ciphertext, updated_at = excluded.updated_at`,
    [scope, organizationId, cipher, now, now],
  );
}

export function getSecret(ctx: AppContext, scope: string): string | null {
  const row = ctx.db.get<{ ciphertext: Uint8Array }>('SELECT ciphertext FROM secrets WHERE scope = ?', [scope]);
  if (!row) return null;
  try {
    return ctx.cipher.decrypt(row.ciphertext);
  } catch {
    ctx.logger.warn('Falha ao decifrar segredo (perfil do Windows alterado?)', { scope });
    return null;
  }
}

export function hasSecret(ctx: AppContext, scope: string): boolean {
  return !!ctx.db.get('SELECT 1 AS ok FROM secrets WHERE scope = ?', [scope]);
}

export function deleteSecret(ctx: AppContext, scope: string): void {
  ctx.db.run('DELETE FROM secrets WHERE scope = ?', [scope]);
}

export const scopes = {
  aiKey: (provider: string) => `ai:${provider}:apiKey`,
  org: (orgId: string, platform: string, name: string) => `org:${orgId}:${platform}:${name}`,
};
