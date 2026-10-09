import { AppError } from '@advertex/shared';
import type { AppContext } from './context';

export function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || value === '') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const bool = (v: unknown): boolean => v === 1 || v === true;

/**
 * Garante que a organização existe. Toda operação de serviço recebe o
 * organizationId explicitamente e filtra por ele no SQL — o isolamento não
 * depende da interface.
 */
export function requireOrg(ctx: AppContext, organizationId: string): { id: string; name: string; is_demo: number } {
  const org = ctx.db.get<{ id: string; name: string; is_demo: number }>('SELECT id, name, is_demo FROM organizations WHERE id = ?', [organizationId]);
  if (!org) throw new AppError('NOT_FOUND', 'Organização não encontrada.');
  return org;
}

/** Garante que uma entidade pertence à organização; caso contrário, NOT_FOUND (sem revelar existência). */
export function requireOwned(ctx: AppContext, table: string, id: string, organizationId: string, label: string): void {
  if (!/^[a-z_]+$/.test(table)) throw new Error('tabela inválida');
  const row = ctx.db.get(`SELECT 1 AS ok FROM ${table} WHERE id = ? AND organization_id = ?`, [id, organizationId]);
  if (!row) throw new AppError('NOT_FOUND', `${label} não encontrado(a).`);
}
