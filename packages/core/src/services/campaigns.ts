import { AppError, CampaignInput, type Campaign } from '@advertex/shared';
import { OBJECTIVES } from '@advertex/advertising-core';
import type { AppContext } from '../context';
import { requireOrg, requireOwned } from '../util';
import { recordAudit } from './audit';

interface CampaignRow {
  id: string;
  organization_id: string;
  project_id: string | null;
  project_name: string | null;
  advertising_account_id: string | null;
  account_name: string | null;
  platform: Campaign['platform'];
  remote_id: string | null;
  name: string;
  objective: string;
  status: Campaign['status'];
  daily_budget: number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  notes: string;
  sync_state: Campaign['syncState'];
  last_synced_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

const toCampaign = (r: CampaignRow): Campaign => ({
  id: r.id,
  organizationId: r.organization_id,
  projectId: r.project_id,
  projectName: r.project_name,
  platform: r.platform,
  advertisingAccountId: r.advertising_account_id,
  accountName: r.account_name,
  remoteId: r.remote_id,
  name: r.name,
  objective: r.objective,
  status: r.status,
  dailyBudget: r.daily_budget,
  currency: r.currency,
  startDate: r.start_date,
  endDate: r.end_date,
  notes: r.notes,
  syncState: r.sync_state,
  lastSyncedAt: r.last_synced_at,
  lastError: r.last_error,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const SELECT = `SELECT c.*, p.name AS project_name, a.name AS account_name FROM campaigns c
  LEFT JOIN projects p ON p.id = c.project_id
  LEFT JOIN advertising_accounts a ON a.id = c.advertising_account_id`;

export function listCampaigns(ctx: AppContext, organizationId: string, platform: Campaign['platform'] | null = null): Campaign[] {
  requireOrg(ctx, organizationId);
  const rows = platform
    ? ctx.db.all<CampaignRow>(`${SELECT} WHERE c.organization_id = ? AND c.platform = ? ORDER BY c.updated_at DESC`, [organizationId, platform])
    : ctx.db.all<CampaignRow>(`${SELECT} WHERE c.organization_id = ? ORDER BY c.updated_at DESC`, [organizationId]);
  return rows.map(toCampaign);
}

export function getCampaign(ctx: AppContext, organizationId: string, id: string): Campaign {
  const row = ctx.db.get<CampaignRow>(`${SELECT} WHERE c.id = ? AND c.organization_id = ?`, [id, organizationId]);
  if (!row) throw new AppError('NOT_FOUND', 'Campanha não encontrada.');
  return toCampaign(row);
}

function validate(ctx: AppContext, organizationId: string, raw: unknown) {
  const data = CampaignInput.parse(raw);
  if (!OBJECTIVES[data.platform].some((o) => o.value === data.objective)) {
    throw new AppError('VALIDATION', 'Objetivo incompatível com a plataforma selecionada.', { fieldErrors: { objective: ['Objetivo inválido para a plataforma'] } });
  }
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    throw new AppError('VALIDATION', 'A data final deve ser posterior à inicial.', { fieldErrors: { endDate: ['Data final anterior à inicial'] } });
  }
  if (data.projectId) requireOwned(ctx, 'projects', data.projectId, organizationId, 'Projeto');
  return data;
}

/** Cria um rascunho LOCAL. Nada é enviado às plataformas nesta fase. */
export function createCampaignDraft(ctx: AppContext, organizationId: string, raw: unknown): Campaign {
  requireOrg(ctx, organizationId);
  const d = validate(ctx, organizationId, raw);
  const id = ctx.newId();
  const now = ctx.now();
  ctx.db.run(
    `INSERT INTO campaigns (id, organization_id, project_id, platform, name, objective, status, daily_budget, currency, start_date, end_date, notes, sync_state, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, 'local_only', ?, ?)`,
    [id, organizationId, d.projectId, d.platform, d.name, d.objective, d.dailyBudget, d.currency, d.startDate, d.endDate, d.notes, now, now],
  );
  recordAudit(ctx, { organizationId, action: 'campaign.draft.create', entityType: 'campaign', entityId: id, details: { platform: d.platform, name: d.name } });
  return getCampaign(ctx, organizationId, id);
}

function assertLocal(c: Campaign): void {
  if (c.syncState !== 'local_only' || c.remoteId) {
    throw new AppError('FORBIDDEN', 'Campanhas importadas da plataforma são somente leitura nesta versão. Edite-as no gerenciador da plataforma e sincronize novamente.');
  }
}

export function updateCampaignDraft(ctx: AppContext, organizationId: string, id: string, raw: unknown): Campaign {
  const c = getCampaign(ctx, organizationId, id);
  assertLocal(c);
  const d = validate(ctx, organizationId, raw);
  ctx.db.run(
    `UPDATE campaigns SET project_id = ?, platform = ?, name = ?, objective = ?, daily_budget = ?, currency = ?, start_date = ?, end_date = ?, notes = ?, updated_at = ?
     WHERE id = ? AND organization_id = ?`,
    [d.projectId, d.platform, d.name, d.objective, d.dailyBudget, d.currency, d.startDate, d.endDate, d.notes, ctx.now(), id, organizationId],
  );
  recordAudit(ctx, { organizationId, action: 'campaign.draft.update', entityType: 'campaign', entityId: id, details: { name: d.name, dailyBudget: d.dailyBudget } });
  return getCampaign(ctx, organizationId, id);
}

export function deleteCampaignDraft(ctx: AppContext, organizationId: string, id: string): void {
  const c = getCampaign(ctx, organizationId, id);
  assertLocal(c);
  ctx.db.run('DELETE FROM campaigns WHERE id = ? AND organization_id = ?', [id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'campaign.draft.delete', entityType: 'campaign', entityId: id, details: { name: c.name } });
}
