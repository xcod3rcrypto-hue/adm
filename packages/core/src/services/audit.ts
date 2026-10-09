import type { AuditEntry } from '@advertex/shared';
import type { AppContext } from '../context';
import { parseJson, requireOrg } from '../util';
import { redact } from '../redact';

export interface AuditInput {
  organizationId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  outcome?: 'success' | 'failure';
  details?: Record<string, unknown>;
}

/** Registra ação crítica. Detalhes passam por redação de segredos. */
export function recordAudit(ctx: AppContext, a: AuditInput): void {
  ctx.db.run(
    `INSERT INTO audit_logs (id, organization_id, actor, action, entity_type, entity_id, outcome, details, correlation_id, created_at)
     VALUES (?, ?, 'local-user', ?, ?, ?, ?, ?, ?, ?)`,
    [
      ctx.newId(),
      a.organizationId,
      a.action,
      a.entityType,
      a.entityId ?? null,
      a.outcome ?? 'success',
      JSON.stringify(redact(a.details ?? {})),
      ctx.correlationId ?? null,
      ctx.now(),
    ],
  );
}

export function listAudit(ctx: AppContext, organizationId: string, limit: number): AuditEntry[] {
  requireOrg(ctx, organizationId);
  return ctx.db
    .all<{ id: string; action: string; entity_type: string; entity_id: string | null; outcome: 'success' | 'failure'; details: string; created_at: string }>(
      'SELECT id, action, entity_type, entity_id, outcome, details, created_at FROM audit_logs WHERE organization_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ?',
      [organizationId, limit],
    )
    .map((r) => ({
      id: r.id,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      outcome: r.outcome,
      details: parseJson<Record<string, unknown>>(r.details, {}),
      createdAt: r.created_at,
    }));
}
