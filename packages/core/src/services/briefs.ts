import { AppError, BriefData, type Brief, type BriefInsights, type BriefVersion } from '@advertex/shared';
import type { AppContext } from '../context';
import { parseJson } from '../util';
import { recordAudit } from './audit';
import { getProject } from './projects';

interface BriefRow {
  id: string;
  project_id: string;
  current_version: number;
  data: string;
  insights: string | null;
  insights_generated_at: string | null;
  insights_model: string | null;
  updated_at: string;
}

const toBrief = (r: BriefRow): Brief => ({
  id: r.id,
  projectId: r.project_id,
  currentVersion: r.current_version,
  data: BriefData.parse(parseJson(r.data, {})),
  insights: r.insights ? parseJson<BriefInsights | null>(r.insights, null) : null,
  insightsGeneratedAt: r.insights_generated_at,
  insightsModel: r.insights_model,
  updatedAt: r.updated_at,
});

export function getBrief(ctx: AppContext, organizationId: string, projectId: string): Brief | null {
  getProject(ctx, organizationId, projectId);
  const row = ctx.db.get<BriefRow>('SELECT * FROM briefs WHERE project_id = ? AND organization_id = ?', [projectId, organizationId]);
  return row ? toBrief(row) : null;
}

/** Cada gravação cria uma nova versão imutável; o briefing aponta para a mais recente. */
export function saveBrief(ctx: AppContext, organizationId: string, projectId: string, raw: unknown, note = ''): Brief {
  getProject(ctx, organizationId, projectId);
  const data = BriefData.parse(raw);
  return ctx.db.transaction(() => {
    const now = ctx.now();
    const existing = ctx.db.get<{ id: string; current_version: number; data: string }>(
      'SELECT id, current_version, data FROM briefs WHERE project_id = ? AND organization_id = ?',
      [projectId, organizationId],
    );
    const json = JSON.stringify(data);
    if (existing && existing.data === json) {
      // Nada mudou: não cria versão duplicada.
      return getBrief(ctx, organizationId, projectId)!;
    }
    let briefId: string;
    let version: number;
    if (existing) {
      briefId = existing.id;
      version = existing.current_version + 1;
      ctx.db.run('UPDATE briefs SET data = ?, current_version = ?, updated_at = ? WHERE id = ?', [json, version, now, briefId]);
    } else {
      briefId = ctx.newId();
      version = 1;
      ctx.db.run('INSERT INTO briefs (id, organization_id, project_id, current_version, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        briefId,
        organizationId,
        projectId,
        version,
        json,
        now,
        now,
      ]);
    }
    ctx.db.run('INSERT INTO brief_versions (id, brief_id, version, data, note, created_at) VALUES (?, ?, ?, ?, ?, ?)', [ctx.newId(), briefId, version, json, note, now]);
    ctx.db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId]);
    recordAudit(ctx, { organizationId, action: 'brief.save', entityType: 'brief', entityId: briefId, details: { projectId, version } });
    return getBrief(ctx, organizationId, projectId)!;
  });
}

export function listBriefVersions(ctx: AppContext, organizationId: string, projectId: string): BriefVersion[] {
  const brief = getBrief(ctx, organizationId, projectId);
  if (!brief) return [];
  return ctx.db
    .all<{ id: string; brief_id: string; version: number; data: string; note: string; created_at: string }>(
      'SELECT * FROM brief_versions WHERE brief_id = ? ORDER BY version DESC',
      [brief.id],
    )
    .map((r) => ({ id: r.id, briefId: r.brief_id, version: r.version, data: BriefData.parse(parseJson(r.data, {})), note: r.note, createdAt: r.created_at }));
}

export function restoreBriefVersion(ctx: AppContext, organizationId: string, projectId: string, versionId: string): Brief {
  const versions = listBriefVersions(ctx, organizationId, projectId);
  const v = versions.find((x) => x.id === versionId);
  if (!v) throw new AppError('NOT_FOUND', 'Versão do briefing não encontrada.');
  return saveBrief(ctx, organizationId, projectId, v.data, `Restaurado da versão ${v.version}`);
}

export function saveBriefInsights(ctx: AppContext, organizationId: string, projectId: string, insights: BriefInsights, model: string): Brief {
  const brief = getBrief(ctx, organizationId, projectId);
  if (!brief) throw new AppError('NOT_FOUND', 'Salve o briefing antes de gerar a análise.');
  ctx.db.run('UPDATE briefs SET insights = ?, insights_generated_at = ?, insights_model = ? WHERE id = ?', [JSON.stringify(insights), ctx.now(), model, brief.id]);
  return getBrief(ctx, organizationId, projectId)!;
}
