import { AppError, StudioRequest, type AiConfigView, type Brief, type StudioResult } from '@advertex/shared';
import { ANTHROPIC_DEFAULT_MODEL, VariationsOutput, InsightsOutput, buildInsightsPrompt, buildVariationsPrompt, type TextProvider } from '@advertex/ai-core';
import { validateText } from '@advertex/advertising-core';
import type { AppContext } from '../context';
import { recordAudit } from './audit';
import { learningsFor } from './brain';
import { getBrief, saveBriefInsights } from './briefs';
import { getProject } from './projects';
import { deleteSecret, getSecret, hasSecret, putSecret, scopes } from './secrets';
import { getSetting, setSetting } from './settings';

interface AiSettings {
  provider: 'anthropic';
  model: string;
}

const DEFAULTS: AiSettings = { provider: 'anthropic', model: ANTHROPIC_DEFAULT_MODEL };

export function getAiConfig(ctx: AppContext): AiConfigView {
  const s = getSetting<AiSettings>(ctx, 'ai.config', DEFAULTS);
  return { provider: s.provider, model: s.model, hasApiKey: hasSecret(ctx, scopes.aiKey(s.provider)), secureStorageAvailable: ctx.cipher.isAvailable() };
}

export function saveAiConfig(ctx: AppContext, input: { model: string; apiKey?: string }): AiConfigView {
  const current = getSetting<AiSettings>(ctx, 'ai.config', DEFAULTS);
  if (input.apiKey) putSecret(ctx, scopes.aiKey(current.provider), null, input.apiKey);
  setSetting(ctx, 'ai.config', { ...current, model: input.model });
  recordAudit(ctx, { organizationId: null, action: 'ai.config.save', entityType: 'settings', details: { model: input.model, keyUpdated: !!input.apiKey } });
  return getAiConfig(ctx);
}

export function clearAiKey(ctx: AppContext): AiConfigView {
  const current = getSetting<AiSettings>(ctx, 'ai.config', DEFAULTS);
  deleteSecret(ctx, scopes.aiKey(current.provider));
  recordAudit(ctx, { organizationId: null, action: 'ai.key.clear', entityType: 'settings' });
  return getAiConfig(ctx);
}

export function aiProvider(ctx: AppContext): TextProvider {
  const s = getSetting<AiSettings>(ctx, 'ai.config', DEFAULTS);
  const apiKey = getSecret(ctx, scopes.aiKey(s.provider));
  if (!apiKey) {
    throw new AppError('NOT_CONFIGURED', 'Nenhum provedor de IA configurado. Acesse Configurações → Provedor de IA e informe sua chave de API da Anthropic.');
  }
  return ctx.createTextProvider({ provider: s.provider, model: s.model, apiKey });
}

export async function testAi(ctx: AppContext): Promise<{ model: string; reply: string }> {
  const p = aiProvider(ctx);
  try {
    const r = await p.ping();
    recordAudit(ctx, { organizationId: null, action: 'ai.test', entityType: 'settings', details: { model: r.model } });
    return r;
  } catch (err) {
    recordAudit(ctx, { organizationId: null, action: 'ai.test', entityType: 'settings', outcome: 'failure', details: { error: err instanceof Error ? err.message : String(err) } });
    throw err;
  }
}

/** Executa uma geração registrando o job (modelo, tokens, status) em ai_jobs. */
export async function runAiJob<T>(
  ctx: AppContext,
  meta: { organizationId: string; projectId: string | null; kind: string },
  p: TextProvider,
  fn: () => Promise<{ data: T; model: string; usage: { inputTokens: number; outputTokens: number } }>,
): Promise<{ jobId: string; data: T; model: string }> {
  const jobId = ctx.newId();
  ctx.db.run(
    "INSERT INTO ai_jobs (id, organization_id, project_id, kind, provider, model, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'running', ?)",
    [jobId, meta.organizationId, meta.projectId, meta.kind, p.id, p.model, ctx.now()],
  );
  try {
    const r = await fn();
    ctx.db.run("UPDATE ai_jobs SET status = 'succeeded', model = ?, input_tokens = ?, output_tokens = ?, finished_at = ? WHERE id = ?", [
      r.model,
      r.usage.inputTokens,
      r.usage.outputTokens,
      ctx.now(),
      jobId,
    ]);
    return { jobId, data: r.data, model: r.model };
  } catch (err) {
    ctx.db.run("UPDATE ai_jobs SET status = 'failed', error = ?, finished_at = ? WHERE id = ?", [err instanceof Error ? err.message.slice(0, 500) : 'erro', ctx.now(), jobId]);
    throw err;
  }
}

export async function generateVariations(ctx: AppContext, organizationId: string, raw: unknown): Promise<StudioResult> {
  const req = StudioRequest.parse(raw);
  const project = getProject(ctx, organizationId, req.projectId);
  const brief = getBrief(ctx, organizationId, req.projectId);
  if (!brief) throw new AppError('NOT_CONFIGURED', 'Preencha e salve o briefing do projeto antes de gerar criativos.');
  const p = aiProvider(ctx);
  const prompt = buildVariationsPrompt({
    brief: brief.data,
    projectName: project.name,
    kind: req.kind,
    funnelStage: req.funnelStage,
    audience: req.audience,
    count: req.count,
    instructions: req.instructions,
    learnings: learningsFor(ctx, organizationId, project.id),
  });
  const { jobId, data, model } = await runAiJob(ctx, { organizationId, projectId: project.id, kind: `studio.${req.kind}` }, p, () =>
    p.generateStructured({ ...prompt, schema: VariationsOutput, maxTokens: 16_000, effort: 'medium' }),
  );
  recordAudit(ctx, { organizationId, action: 'ai.generate', entityType: 'ai_job', entityId: jobId, details: { kind: req.kind, count: data.variations.length, model } });
  return {
    jobId,
    model,
    variations: data.variations.map((v) => {
      const check = validateText(req.kind, v.text);
      return { text: v.text.trim(), rationale: v.rationale, characterCount: check.count, withinLimit: check.withinLimit, limit: check.limit };
    }),
  };
}

export async function generateBriefInsights(ctx: AppContext, organizationId: string, projectId: string, pageExcerpt: string | null): Promise<Brief> {
  const project = getProject(ctx, organizationId, projectId);
  const brief = getBrief(ctx, organizationId, projectId);
  if (!brief) throw new AppError('NOT_CONFIGURED', 'Salve o briefing antes de gerar a análise estratégica.');
  const p = aiProvider(ctx);
  const prompt = buildInsightsPrompt(brief.data, project.name, pageExcerpt);
  const { jobId, data, model } = await runAiJob(ctx, { organizationId, projectId, kind: 'brief.insights' }, p, () =>
    p.generateStructured({ ...prompt, schema: InsightsOutput, maxTokens: 16_000, effort: 'medium' }),
  );
  recordAudit(ctx, { organizationId, action: 'ai.brief.insights', entityType: 'ai_job', entityId: jobId, details: { model } });
  return saveBriefInsights(ctx, organizationId, projectId, data, model);
}
