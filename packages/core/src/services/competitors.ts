import { AppError, CompetitorInput, ReferenceClassification, type CompetitiveAnalysis, type Competitor, type CompetitorReference, type PageAnalysis } from '@advertex/shared';
import { CompetitiveAnalysisOutput, ReferenceClassificationOutput, buildClassificationPrompt, buildCompetitiveAnalysisPrompt } from '@advertex/ai-core';
import type { AppContext } from '../context';
import { parseJson, requireOrg, requireOwned } from '../util';
import { aiProvider, runAiJob } from './ai';
import { recordAudit } from './audit';
import { getBrief } from './briefs';

/**
 * Inteligência competitiva baseada apenas em páginas PÚBLICAS capturadas sob
 * demanda (leitor com proteção contra SSRF e sem contornar autenticação).
 * Cada referência guarda a URL de origem e a data de captura.
 */

interface CompetitorRow {
  id: string;
  name: string;
  website_url: string;
  notes: string;
  project_id: string | null;
  project_name: string | null;
  created_at: string;
  updated_at: string;
}

interface RefRow {
  id: string;
  competitor_id: string;
  source_url: string;
  captured_at: string;
  title: string;
  excerpt: string;
  promise: string;
  concept: string;
  audience: string;
  format: string;
  positioning: string;
}

const toRef = (r: RefRow): CompetitorReference => ({
  id: r.id,
  sourceUrl: r.source_url,
  capturedAt: r.captured_at,
  title: r.title,
  excerpt: r.excerpt,
  promise: r.promise,
  concept: r.concept,
  audience: r.audience,
  format: r.format,
  positioning: r.positioning,
});

export function listCompetitors(ctx: AppContext, organizationId: string): Competitor[] {
  requireOrg(ctx, organizationId);
  const refs = ctx.db.all<RefRow>('SELECT * FROM competitor_references WHERE organization_id = ? ORDER BY captured_at DESC', [organizationId]);
  return ctx.db
    .all<CompetitorRow>(
      'SELECT c.*, p.name AS project_name FROM competitors c LEFT JOIN projects p ON p.id = c.project_id WHERE c.organization_id = ? ORDER BY c.name COLLATE NOCASE',
      [organizationId],
    )
    .map((c) => ({
      id: c.id,
      name: c.name,
      websiteUrl: c.website_url,
      notes: c.notes,
      projectId: c.project_id,
      projectName: c.project_name,
      references: refs.filter((r) => r.competitor_id === c.id).map(toRef),
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
}

function getCompetitor(ctx: AppContext, organizationId: string, id: string): Competitor {
  const c = listCompetitors(ctx, organizationId).find((x) => x.id === id);
  if (!c) throw new AppError('NOT_FOUND', 'Concorrente não encontrado.');
  return c;
}

export function createCompetitor(ctx: AppContext, organizationId: string, raw: unknown): Competitor {
  requireOrg(ctx, organizationId);
  const d = CompetitorInput.parse(raw);
  if (d.projectId) requireOwned(ctx, 'projects', d.projectId, organizationId, 'Projeto');
  const id = ctx.newId();
  const now = ctx.now();
  ctx.db.run('INSERT INTO competitors (id, organization_id, project_id, name, website_url, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
    id,
    organizationId,
    d.projectId,
    d.name,
    d.websiteUrl,
    d.notes,
    now,
    now,
  ]);
  recordAudit(ctx, { organizationId, action: 'competitor.create', entityType: 'competitor', entityId: id, details: { name: d.name } });
  return getCompetitor(ctx, organizationId, id);
}

export function updateCompetitor(ctx: AppContext, organizationId: string, id: string, raw: unknown): Competitor {
  getCompetitor(ctx, organizationId, id);
  const d = CompetitorInput.parse(raw);
  if (d.projectId) requireOwned(ctx, 'projects', d.projectId, organizationId, 'Projeto');
  ctx.db.run('UPDATE competitors SET project_id = ?, name = ?, website_url = ?, notes = ?, updated_at = ? WHERE id = ? AND organization_id = ?', [
    d.projectId,
    d.name,
    d.websiteUrl,
    d.notes,
    ctx.now(),
    id,
    organizationId,
  ]);
  recordAudit(ctx, { organizationId, action: 'competitor.update', entityType: 'competitor', entityId: id });
  return getCompetitor(ctx, organizationId, id);
}

export function deleteCompetitor(ctx: AppContext, organizationId: string, id: string): void {
  getCompetitor(ctx, organizationId, id);
  ctx.db.run('DELETE FROM competitors WHERE id = ? AND organization_id = ?', [id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'competitor.delete', entityType: 'competitor', entityId: id });
}

/** Grava uma referência a partir de uma página pública já lida pelo leitor seguro. */
export function addCompetitorReference(ctx: AppContext, organizationId: string, competitorId: string, page: PageAnalysis): CompetitorReference {
  getCompetitor(ctx, organizationId, competitorId);
  const id = ctx.newId();
  const excerpt = [page.description, ...page.headings, page.textExcerpt].filter(Boolean).join('\n').slice(0, 4000);
  ctx.db.run(
    `INSERT INTO competitor_references (id, organization_id, competitor_id, source_url, captured_at, title, excerpt, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, organizationId, competitorId, page.finalUrl, page.fetchedAt, page.title.slice(0, 300), excerpt, ctx.now(), ctx.now()],
  );
  recordAudit(ctx, { organizationId, action: 'competitor.capture', entityType: 'competitor', entityId: competitorId, details: { host: new URL(page.finalUrl).hostname } });
  return toRef(ctx.db.get<RefRow>('SELECT * FROM competitor_references WHERE id = ?', [id])!);
}

function getRef(ctx: AppContext, organizationId: string, id: string): RefRow & { competitor_name: string } {
  const r = ctx.db.get<RefRow & { competitor_name: string }>(
    'SELECT r.*, c.name AS competitor_name FROM competitor_references r JOIN competitors c ON c.id = r.competitor_id WHERE r.id = ? AND r.organization_id = ?',
    [id, organizationId],
  );
  if (!r) throw new AppError('NOT_FOUND', 'Referência não encontrada.');
  return r;
}

export function classifyReference(ctx: AppContext, organizationId: string, id: string, raw: unknown): CompetitorReference {
  getRef(ctx, organizationId, id);
  const d = ReferenceClassification.parse(raw);
  ctx.db.run('UPDATE competitor_references SET promise = ?, concept = ?, audience = ?, format = ?, positioning = ?, updated_at = ? WHERE id = ? AND organization_id = ?', [
    d.promise,
    d.concept,
    d.audience,
    d.format,
    d.positioning,
    ctx.now(),
    id,
    organizationId,
  ]);
  recordAudit(ctx, { organizationId, action: 'competitor.classify', entityType: 'competitor_reference', entityId: id });
  return toRef(getRef(ctx, organizationId, id));
}

export function deleteReference(ctx: AppContext, organizationId: string, id: string): void {
  getRef(ctx, organizationId, id);
  ctx.db.run('DELETE FROM competitor_references WHERE id = ? AND organization_id = ?', [id, organizationId]);
}

export async function classifyReferenceWithAi(ctx: AppContext, organizationId: string, id: string): Promise<CompetitorReference> {
  const r = getRef(ctx, organizationId, id);
  const p = aiProvider(ctx);
  const prompt = buildClassificationPrompt({ competitor: r.competitor_name, url: r.source_url, capturedAt: r.captured_at, title: r.title, excerpt: r.excerpt });
  const { data } = await runAiJob(ctx, { organizationId, projectId: null, kind: 'competitor.classify' }, p, () =>
    p.generateStructured({ ...prompt, schema: ReferenceClassificationOutput, maxTokens: 4000, effort: 'low' }),
  );
  const clip = (s: string) => s.trim().slice(0, 300);
  return classifyReference(ctx, organizationId, id, { promise: clip(data.promise), concept: clip(data.concept), audience: clip(data.audience), format: clip(data.format), positioning: clip(data.positioning) });
}

const ANALYSIS_KIND = 'competitive_analysis';

export async function analyzeCompetition(ctx: AppContext, organizationId: string, projectId: string | null): Promise<CompetitiveAnalysis> {
  requireOrg(ctx, organizationId);
  if (projectId) requireOwned(ctx, 'projects', projectId, organizationId, 'Projeto');
  const competitors = listCompetitors(ctx, organizationId).filter((c) => !projectId || c.projectId === projectId || c.projectId === null);
  const references = competitors.flatMap((c) => c.references.map((r) => ({ competitor: c.name, url: r.sourceUrl, capturedAt: r.capturedAt, title: r.title, promise: r.promise, concept: r.concept, audience: r.audience, format: r.format, positioning: r.positioning, excerpt: r.excerpt })));
  if (references.length < 2) throw new AppError('VALIDATION', 'Capture ao menos duas referências públicas de concorrentes antes de analisar padrões.');
  const brief = projectId ? getBrief(ctx, organizationId, projectId) : null;
  const project = projectId ? ctx.db.get<{ name: string }>('SELECT name FROM projects WHERE id = ?', [projectId]) : undefined;
  const p = aiProvider(ctx);
  const prompt = buildCompetitiveAnalysisPrompt({ brief: brief?.data ?? null, projectName: project?.name ?? null, references: references.slice(0, 30) });
  const { data, model } = await runAiJob(ctx, { organizationId, projectId, kind: 'competitor.analysis' }, p, () =>
    p.generateStructured({ ...prompt, schema: CompetitiveAnalysisOutput, maxTokens: 12_000, effort: 'medium' }),
  );
  const id = ctx.newId();
  const now = ctx.now();
  const caveats = [...data.caveats, `Baseado em ${references.length} referência(s) pública(s) capturada(s); não inclui dados de desempenho de concorrentes.`];
  ctx.db.run(
    `INSERT INTO insights (id, organization_id, project_id, kind, title, body, evidence, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      organizationId,
      projectId,
      ANALYSIS_KIND,
      'Análise competitiva',
      JSON.stringify({ ...data, caveats, model, referenceCount: references.length }),
      JSON.stringify(references.map((r) => ({ label: r.competitor, value: `${r.url} (${r.capturedAt.slice(0, 10)})` }))),
      now,
    ],
  );
  recordAudit(ctx, { organizationId, action: 'competitor.analysis', entityType: 'insight', entityId: id, details: { references: references.length, model } });
  return getLatestCompetitiveAnalysis(ctx, organizationId, projectId)!;
}

export function getLatestCompetitiveAnalysis(ctx: AppContext, organizationId: string, projectId: string | null): CompetitiveAnalysis | null {
  requireOrg(ctx, organizationId);
  const row = projectId
    ? ctx.db.get<{ id: string; project_id: string | null; body: string; created_at: string }>('SELECT * FROM insights WHERE organization_id = ? AND kind = ? AND project_id = ? ORDER BY created_at DESC LIMIT 1', [organizationId, ANALYSIS_KIND, projectId])
    : ctx.db.get<{ id: string; project_id: string | null; body: string; created_at: string }>('SELECT * FROM insights WHERE organization_id = ? AND kind = ? AND project_id IS NULL ORDER BY created_at DESC LIMIT 1', [organizationId, ANALYSIS_KIND]);
  if (!row) return null;
  const b = parseJson<{ patterns?: string[]; opportunities?: string[]; differentiationIdeas?: string[]; caveats?: string[]; model?: string; referenceCount?: number }>(row.body, {});
  return {
    id: row.id,
    projectId: row.project_id,
    generatedAt: row.created_at,
    model: b.model ?? '',
    referenceCount: b.referenceCount ?? 0,
    patterns: b.patterns ?? [],
    opportunities: b.opportunities ?? [],
    differentiationIdeas: b.differentiationIdeas ?? [],
    caveats: b.caveats ?? [],
  };
}
