import { AppError, CreativeInput, type Creative, type CreativeStatus, type CreativeVersion } from '@advertex/shared';
import type { AppContext } from '../context';
import { parseJson, requireOrg, requireOwned } from '../util';
import { recordAudit } from './audit';

interface CreativeRow {
  id: string;
  organization_id: string;
  project_id: string | null;
  project_name: string | null;
  title: string;
  kind: Creative['kind'];
  platform: Creative['platform'];
  funnel_stage: Creative['funnelStage'];
  body: string;
  cta: string;
  tags: string;
  asset_ids: string;
  status: CreativeStatus;
  source: Creative['source'];
  version: number;
  created_at: string;
  updated_at: string;
}

const toCreative = (r: CreativeRow): Creative => ({
  id: r.id,
  organizationId: r.organization_id,
  projectId: r.project_id,
  projectName: r.project_name,
  title: r.title,
  kind: r.kind,
  platform: r.platform,
  funnelStage: r.funnel_stage,
  body: r.body,
  cta: r.cta,
  tags: parseJson<string[]>(r.tags, []),
  assetIds: parseJson<string[]>(r.asset_ids, []),
  status: r.status,
  source: r.source,
  version: r.version,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const SELECT = 'SELECT c.*, p.name AS project_name FROM creatives c LEFT JOIN projects p ON p.id = c.project_id';
const likeEscape = (s: string) => s.replace(/[\\%_]/g, (m) => `\\${m}`);

export interface CreativeFilter {
  projectId?: string | null;
  search?: string;
  status?: CreativeStatus | null;
  tag?: string;
}

export function listCreatives(ctx: AppContext, organizationId: string, f: CreativeFilter = {}): Creative[] {
  requireOrg(ctx, organizationId);
  const where = ['c.organization_id = ?'];
  const params: Array<string> = [organizationId];
  if (f.projectId) {
    where.push('c.project_id = ?');
    params.push(f.projectId);
  }
  if (f.status) {
    where.push('c.status = ?');
    params.push(f.status);
  }
  if (f.search) {
    where.push("(c.title LIKE ? ESCAPE '\\' OR c.body LIKE ? ESCAPE '\\')");
    const q = `%${likeEscape(f.search)}%`;
    params.push(q, q);
  }
  if (f.tag) {
    where.push("c.tags LIKE ? ESCAPE '\\'");
    params.push(`%${likeEscape(JSON.stringify(f.tag))}%`);
  }
  return ctx.db.all<CreativeRow>(`${SELECT} WHERE ${where.join(' AND ')} ORDER BY c.updated_at DESC`, params).map(toCreative);
}

export function getCreative(ctx: AppContext, organizationId: string, id: string): Creative {
  const row = ctx.db.get<CreativeRow>(`${SELECT} WHERE c.id = ? AND c.organization_id = ?`, [id, organizationId]);
  if (!row) throw new AppError('NOT_FOUND', 'Criativo não encontrado.');
  return toCreative(row);
}

function checkRefs(ctx: AppContext, organizationId: string, data: ReturnType<typeof CreativeInput.parse>): void {
  if (data.projectId) requireOwned(ctx, 'projects', data.projectId, organizationId, 'Projeto');
  for (const a of data.assetIds) requireOwned(ctx, 'assets', a, organizationId, 'Ativo');
}

const uniqTags = (tags: string[]) => [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];

export function createCreative(ctx: AppContext, organizationId: string, raw: unknown): Creative {
  requireOrg(ctx, organizationId);
  const data = CreativeInput.parse(raw);
  checkRefs(ctx, organizationId, data);
  return ctx.db.transaction(() => {
    const id = ctx.newId();
    const now = ctx.now();
    ctx.db.run(
      `INSERT INTO creatives (id, organization_id, project_id, title, kind, platform, funnel_stage, body, cta, tags, asset_ids, status, source, ai_job_id, version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, 1, ?, ?)`,
      [
        id,
        organizationId,
        data.projectId,
        data.title,
        data.kind,
        data.platform,
        data.funnelStage,
        data.body,
        data.cta,
        JSON.stringify(uniqTags(data.tags)),
        JSON.stringify(data.assetIds),
        data.source,
        data.aiJobId,
        now,
        now,
      ],
    );
    ctx.db.run('INSERT INTO creative_versions (id, creative_id, version, title, body, cta, note, created_at) VALUES (?, ?, 1, ?, ?, ?, ?, ?)', [
      ctx.newId(),
      id,
      data.title,
      data.body,
      data.cta,
      data.source === 'ai' ? 'Gerado com IA' : 'Versão inicial',
      now,
    ]);
    recordAudit(ctx, { organizationId, action: 'creative.create', entityType: 'creative', entityId: id, details: { source: data.source, kind: data.kind } });
    return getCreative(ctx, organizationId, id);
  });
}

/** Alterações de texto geram nova versão; aprovados voltam para rascunho ao editar. */
export function updateCreative(ctx: AppContext, organizationId: string, id: string, raw: unknown, note = ''): Creative {
  const current = getCreative(ctx, organizationId, id);
  const data = CreativeInput.parse(raw);
  checkRefs(ctx, organizationId, data);
  return ctx.db.transaction(() => {
    const now = ctx.now();
    const textChanged = current.title !== data.title || current.body !== data.body || current.cta !== data.cta;
    const version = textChanged ? current.version + 1 : current.version;
    const status: CreativeStatus = textChanged && current.status === 'approved' ? 'draft' : current.status;
    ctx.db.run(
      `UPDATE creatives SET project_id = ?, title = ?, kind = ?, platform = ?, funnel_stage = ?, body = ?, cta = ?, tags = ?, asset_ids = ?, status = ?, version = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`,
      [
        data.projectId,
        data.title,
        data.kind,
        data.platform,
        data.funnelStage,
        data.body,
        data.cta,
        JSON.stringify(uniqTags(data.tags)),
        JSON.stringify(data.assetIds),
        status,
        version,
        now,
        id,
        organizationId,
      ],
    );
    if (textChanged) {
      ctx.db.run('INSERT INTO creative_versions (id, creative_id, version, title, body, cta, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        ctx.newId(),
        id,
        version,
        data.title,
        data.body,
        data.cta,
        note,
        now,
      ]);
    }
    recordAudit(ctx, { organizationId, action: 'creative.update', entityType: 'creative', entityId: id, details: { version, textChanged } });
    return getCreative(ctx, organizationId, id);
  });
}

export function setCreativeStatus(ctx: AppContext, organizationId: string, id: string, status: CreativeStatus): Creative {
  const c = getCreative(ctx, organizationId, id);
  ctx.db.run('UPDATE creatives SET status = ?, updated_at = ? WHERE id = ? AND organization_id = ?', [status, ctx.now(), id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'creative.status', entityType: 'creative', entityId: id, details: { from: c.status, to: status, version: c.version } });
  return getCreative(ctx, organizationId, id);
}

export function listCreativeVersions(ctx: AppContext, organizationId: string, id: string): CreativeVersion[] {
  getCreative(ctx, organizationId, id);
  return ctx.db
    .all<{ id: string; creative_id: string; version: number; title: string; body: string; cta: string; note: string; created_at: string }>(
      'SELECT * FROM creative_versions WHERE creative_id = ? ORDER BY version DESC',
      [id],
    )
    .map((r) => ({ id: r.id, creativeId: r.creative_id, version: r.version, title: r.title, body: r.body, cta: r.cta, note: r.note, createdAt: r.created_at }));
}

export function deleteCreative(ctx: AppContext, organizationId: string, id: string): void {
  const c = getCreative(ctx, organizationId, id);
  ctx.db.run('DELETE FROM creatives WHERE id = ? AND organization_id = ?', [id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'creative.delete', entityType: 'creative', entityId: id, details: { title: c.title } });
}
