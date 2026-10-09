import { readFileSync } from 'node:fs';
import { AppError, ImageGenerationRequest, type ImageAiConfigView, type ImageGenerationResult, type Asset } from '@advertex/shared';
import { AiProviderError, GEMINI_DEFAULT_IMAGE_MODEL, GEMINI_IMAGE_MODELS, GeminiImageProvider, buildImagePrompt } from '@advertex/ai-core';
import type { AppContext } from '../context';
import { requireOrg } from '../util';
import { recordAudit } from './audit';
import { assetFilePath, getAsset, storeAssetBuffer } from './assets';
import { learningsFor } from './brain';
import { getBrief } from './briefs';
import { getProject } from './projects';
import { deleteSecret, getSecret, hasSecret, putSecret, scopes } from './secrets';
import { getSetting, setSetting } from './settings';

/**
 * Geração de imagens de criativos com o Gemini ("Nano Banana"). As imagens
 * vão direto para a biblioteca de ativos (tag "ia-gemini"), com o job
 * registrado em ai_jobs e na auditoria.
 */

const KEY_SCOPE = scopes.aiKey('gemini');
const SETTING = 'ai.image.config';

export function getImageAiConfig(ctx: AppContext): ImageAiConfigView {
  const s = getSetting<{ model: string }>(ctx, SETTING, { model: GEMINI_DEFAULT_IMAGE_MODEL });
  return { model: s.model, hasApiKey: hasSecret(ctx, KEY_SCOPE), secureStorageAvailable: ctx.cipher.isAvailable(), models: GEMINI_IMAGE_MODELS.map((m) => ({ ...m })) };
}

export function saveImageAiConfig(ctx: AppContext, input: { model: string; apiKey?: string }): ImageAiConfigView {
  if (input.apiKey) putSecret(ctx, KEY_SCOPE, null, input.apiKey);
  setSetting(ctx, SETTING, { model: input.model });
  recordAudit(ctx, { organizationId: null, action: 'ai.image.config.save', entityType: 'settings', details: { model: input.model, keyUpdated: !!input.apiKey } });
  return getImageAiConfig(ctx);
}

export function clearImageAiKey(ctx: AppContext): ImageAiConfigView {
  deleteSecret(ctx, KEY_SCOPE);
  recordAudit(ctx, { organizationId: null, action: 'ai.image.key.clear', entityType: 'settings' });
  return getImageAiConfig(ctx);
}

function provider(ctx: AppContext): GeminiImageProvider {
  const apiKey = getSecret(ctx, KEY_SCOPE);
  if (!apiKey) throw new AppError('NOT_CONFIGURED', 'Configure a chave da API do Gemini em Configurações → Geração de imagens.');
  return new GeminiImageProvider({ apiKey, model: getImageAiConfig(ctx).model, fetchImpl: ctx.fetch });
}

const toAppError = (err: unknown) =>
  err instanceof AiProviderError ? new AppError(err.kind === 'auth' ? 'NOT_CONFIGURED' : 'EXTERNAL_API', err.message, { cause: err }) : err;

export async function testImageAi(ctx: AppContext): Promise<{ model: string }> {
  try {
    return await provider(ctx).ping();
  } catch (err) {
    throw toAppError(err);
  }
}

export async function generateCreativeImages(ctx: AppContext, organizationId: string, raw: unknown): Promise<ImageGenerationResult> {
  requireOrg(ctx, organizationId);
  const req = ImageGenerationRequest.parse(raw);
  const project = req.projectId ? getProject(ctx, organizationId, req.projectId) : null;
  const brief = req.useBrief && project ? getBrief(ctx, organizationId, project.id) : null;
  const references = req.referenceAssetIds.map((id) => {
    const a = getAsset(ctx, organizationId, id);
    if (!a.mimeType.startsWith('image/')) throw new AppError('VALIDATION', `"${a.fileName}" não é uma imagem.`);
    return { mimeType: a.mimeType, data: new Uint8Array(readFileSync(assetFilePath(ctx, organizationId, id).path)) };
  });
  const p = provider(ctx);
  const prompt = buildImagePrompt({ description: req.description, aspectRatio: req.aspectRatio, brief: brief?.data ?? null, withText: req.withText, hasReference: references.length > 0, learnings: learningsFor(ctx, organizationId, project?.id ?? null) });

  const jobId = ctx.newId();
  ctx.db.run("INSERT INTO ai_jobs (id, organization_id, project_id, kind, provider, model, status, created_at) VALUES (?, ?, ?, 'image.generate', 'gemini', ?, 'running', ?)", [
    jobId,
    organizationId,
    project?.id ?? null,
    p.model,
    ctx.now(),
  ]);
  const assets: Asset[] = [];
  const errors: string[] = [];
  for (let i = 0; i < req.count; i += 1) {
    try {
      const out = await p.generate({ prompt, aspectRatio: req.aspectRatio, imageSize: req.imageSize, references });
      for (const img of out.images.slice(0, 1)) {
        const name = `ia-${req.aspectRatio.replace(':', 'x')}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}-${i + 1}`;
        const asset = storeAssetBuffer(ctx, organizationId, project?.id ?? null, name, Buffer.from(img.data), ['ia-gemini', req.aspectRatio]);
        if (!assets.some((a) => a.id === asset.id)) assets.push(asset);
      }
    } catch (err) {
      const e = toAppError(err);
      // Erros de chave/modelo valem para todas as tentativas: interrompe.
      if (err instanceof AiProviderError && (err.kind === 'auth' || err.kind === 'bad_request' || err.kind === 'rate_limit')) {
        ctx.db.run("UPDATE ai_jobs SET status = 'failed', error = ?, finished_at = ? WHERE id = ?", [err.message.slice(0, 500), ctx.now(), jobId]);
        throw e;
      }
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  ctx.db.run('UPDATE ai_jobs SET status = ?, error = ?, finished_at = ? WHERE id = ?', [
    assets.length > 0 ? 'succeeded' : 'failed',
    errors[0]?.slice(0, 500) ?? null,
    ctx.now(),
    jobId,
  ]);
  recordAudit(ctx, { organizationId, action: 'ai.image.generate', entityType: 'ai_job', entityId: jobId, details: { model: p.model, requested: req.count, generated: assets.length, aspectRatio: req.aspectRatio } });
  if (assets.length === 0) throw new AppError('EXTERNAL_API', errors[0] ?? 'O Gemini não gerou imagens.');
  const notes = [`Gerado com ${p.model}${brief ? ' usando o briefing do projeto' : ''}. Imagens salvas na biblioteca com a tag "ia-gemini".`];
  if (errors.length) notes.push(`${errors.length} geração(ões) falharam: ${errors[0]}`);
  return { model: p.model, assets, failed: errors.length, notes };
}
