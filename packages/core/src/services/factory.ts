import { validateText } from '@advertex/advertising-core';
import { buildFactoryPrompt, FactoryOutput } from '@advertex/ai-core';
import { AppError, FactoryRequest, type Asset, type Creative, type FactoryResult } from '@advertex/shared';
import type { AppContext } from '../context';
import { aiProvider, runAiJob } from './ai';
import { recordAudit } from './audit';
import { getAdPerformance, learningsFor } from './brain';
import { getBrief } from './briefs';
import { createCreative, updateCreative } from './creatives';
import { createExperiment } from './experiments';
import { generateCreativeImages, getImageAiConfig } from './images';
import { getProject } from './projects';

const MAX_IMAGES = 16;

/**
 * Fábrica de criativos: gera uma bateria de conceitos (ângulos diferentes ou
 * variações de um vencedor), cria os criativos na biblioteca, gera as imagens
 * em cada formato e monta o experimento A/B para comparar os conceitos.
 */
export async function runCreativeFactory(ctx: AppContext, organizationId: string, raw: unknown): Promise<FactoryResult> {
  const req = FactoryRequest.parse(raw);
  const project = getProject(ctx, organizationId, req.projectId);
  const brief = getBrief(ctx, organizationId, project.id);
  if (!brief) throw new AppError('NOT_CONFIGURED', 'Preencha e salve o briefing do projeto antes de usar a fábrica.');
  const winner = req.winnerAdId ? getAdPerformance(ctx, organizationId, req.winnerAdId) : null;
  const p = aiProvider(ctx);
  const prompt = buildFactoryPrompt({
    brief: brief.data,
    projectName: project.name,
    kind: req.kind,
    funnelStage: req.funnelStage,
    count: req.angles,
    instructions: req.instructions,
    learnings: learningsFor(ctx, organizationId, project.id),
    winner: winner
      ? { headline: winner.headline, body: winner.body, metric: `CTR ${((winner.ctr ?? 0) * 100).toFixed(2)}%${winner.cpa !== null ? `, CPA ${winner.cpa.toFixed(2)} ${winner.currency}` : ''}` }
      : null,
  });
  const { jobId, data, model } = await runAiJob(ctx, { organizationId, projectId: project.id, kind: 'factory.concepts' }, p, () =>
    p.generateStructured({ ...prompt, schema: FactoryOutput, maxTokens: 12_000, effort: 'medium' }),
  );

  const notes: string[] = [];
  const platform = req.kind === 'google_rsa_description' ? 'google' : req.kind === 'meta_primary_text' ? 'meta' : null;
  const concepts = data.concepts.slice(0, req.angles).filter((c) => {
    const ok = validateText(req.kind, c.text.trim());
    if (!ok.withinLimit && ok.enforcement === 'hard') {
      notes.push(`Conceito "${c.name}" descartado: texto com ${ok.count}/${ok.limit} caracteres.`);
      return false;
    }
    return c.text.trim().length > 0;
  });
  if (concepts.length === 0) throw new AppError('EXTERNAL_API', 'A IA não gerou conceitos válidos. Tente novamente.');

  const batchTag = `fabrica-${ctx.now().slice(0, 10)}`;
  const creatives: Creative[] = concepts.map((c) =>
    createCreative(ctx, organizationId, {
      projectId: project.id,
      title: `Fábrica · ${c.name}`.slice(0, 200),
      kind: req.kind,
      platform,
      funnelStage: req.funnelStage,
      body: c.text.trim(),
      cta: c.cta.trim().slice(0, 60),
      tags: ['fabrica', batchTag, c.angle, ...(winner ? ['variacao-vencedor'] : [])],
      source: 'ai',
      aiJobId: jobId,
    }),
  );

  // Imagens: um por conceito × formato (sequencial, para respeitar o limite da API do Gemini).
  const assets: Asset[] = [];
  let failedImages = 0;
  if (req.withImages && req.formats.length > 0) {
    if (!getImageAiConfig(ctx).hasApiKey) {
      notes.push('Imagens não geradas: configure a chave do Gemini em Configurações → Geração de imagens.');
    } else {
      let budget = MAX_IMAGES;
      for (let i = 0; i < concepts.length; i += 1) {
        const ids: string[] = [];
        for (const format of req.formats) {
          if (budget <= 0) break;
          budget -= 1;
          try {
            const r = await generateCreativeImages(ctx, organizationId, {
              projectId: project.id,
              description: `${concepts[i]!.imageConcept}\nConceito: ${concepts[i]!.name} — ${concepts[i]!.hook}`.slice(0, 2000),
              aspectRatio: format,
              imageSize: req.imageSize,
              count: 1,
              useBrief: true,
              withText: false,
            });
            failedImages += r.failed;
            ids.push(...r.assets.map((a) => a.id));
            assets.push(...r.assets);
          } catch (err) {
            failedImages += 1;
            notes.push(`Imagem ${format} de "${concepts[i]!.name}": ${err instanceof Error ? err.message : String(err)}`);
            // Sem cota/chave inválida: não adianta insistir nas próximas.
            if (/cota|chave|faturamento/i.test(err instanceof Error ? err.message : '')) budget = 0;
          }
        }
        if (ids.length) creatives[i] = updateCreative(ctx, organizationId, creatives[i]!.id, { ...creatives[i]!, assetIds: ids, aiJobId: jobId }, 'Imagens da fábrica');
      }
      if (concepts.length * req.formats.length > MAX_IMAGES) notes.push(`Limite de ${MAX_IMAGES} imagens por lote atingido.`);
    }
  }

  let experimentId: string | null = null;
  if (req.createExperiment && creatives.length >= 2) {
    const exp = createExperiment(ctx, organizationId, {
      projectId: project.id,
      hypothesis: winner
        ? `Variações do vencedor "${winner.adName}" podem superar o original mudando uma variável por vez.`
        : `Qual ângulo prende mais a atenção do público: ${concepts.map((c) => c.angle.replace('_', ' ')).join(', ')}?`,
      variable: winner ? 'Variação do criativo vencedor' : 'Ângulo do criativo',
      primaryMetric: 'ctr',
      decisionCriteria: 'Vence a variante com CTR maior com confiança estatística de 95%; depois confirmar em taxa de conversão.',
      variants: creatives.slice(0, 6).map((c, i) => ({ label: `${String.fromCharCode(65 + i)} · ${concepts[i]!.name}`.slice(0, 80), creativeId: c.id })),
    });
    experimentId = exp.id;
    if (creatives.length > 6) notes.push('O experimento comporta até 6 variantes: os primeiros 6 conceitos entraram nele.');
  }

  recordAudit(ctx, { organizationId, action: 'factory.run', entityType: 'project', entityId: project.id, details: { concepts: creatives.length, images: assets.length, failedImages, experimentId, winner: !!winner, model } });
  return { creatives, assets, experimentId, failedImages, notes, model };
}
