import { describe, expect, it, vi } from 'vitest';
import { fakeProvider, jsonResponse, makeTestContext } from '../testing';
import { saveAiConfig } from './ai';
import { listAdPerformance } from './brain';
import { enableDemo } from './demo';
import { getExperiment } from './experiments';
import { runCreativeFactory } from './factory';
import { saveImageAiConfig } from './images';

const PNG_1x1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

const concept = (angle: string, name: string, text: string) => ({ angle, name, hook: `${name}?`, headline: name, text, cta: 'Comprar', imageConcept: `Cena de ${name}`, hypothesis: 'h' });

describe('fábrica de criativos', () => {
  it('gera conceitos com aprendizados, imagens por formato e o experimento A/B', async () => {
    const prompts: string[] = [];
    let img = 0;
    const fetch = vi.fn(async () => {
      img += 1;
      // PNGs diferentes para não deduplicar na biblioteca.
      const png = Buffer.from(PNG_1x1, 'base64');
      png[png.length - 13] = img;
      return jsonResponse({ candidates: [{ finishReason: 'STOP', content: { parts: [{ inlineData: { mimeType: 'image/png', data: png.toString('base64') } }] } }] });
    });
    const ctx = await makeTestContext({
      fetch: fetch as never,
      createTextProvider: () =>
        fakeProvider({
          generateStructured: (async (req: { prompt: string }) => {
            prompts.push(req.prompt);
            return {
              data: {
                concepts: [
                  concept('dor', 'Café amargo', 'Cansado de café amargo? Experimente grãos frescos.'),
                  concept('prova_social', 'Clientes aprovam', '4.800 clientes trocaram de café. Prove você também.'),
                  concept('oferta', 'Primeira compra', 'Frete grátis na primeira compra de cafés especiais.'),
                ],
              },
              model: 'm',
              usage: { inputTokens: 1, outputTokens: 1 },
            };
          }) as never,
        }),
    });
    const org = enableDemo(ctx, new Date('2026-10-09T12:00:00Z'));
    saveAiConfig(ctx, { model: 'm', apiKey: 'sk-ant-xyz-1234567890' });
    saveImageAiConfig(ctx, { model: 'gemini-2.5-flash-image', apiKey: 'AIza-teste-123456' });
    const projectId = ctx.db.get<{ id: string }>('SELECT id FROM projects WHERE organization_id = ? ORDER BY created_at LIMIT 1', [org.id])!.id;
    const winner = listAdPerformance(ctx, org.id, { platform: 'meta' })[0]!;

    const r = await runCreativeFactory(ctx, org.id, { projectId, angles: 3, formats: ['1:1', '9:16'], winnerAdId: winner.id });
    expect(r.creatives).toHaveLength(3);
    expect(r.creatives[0]).toMatchObject({ kind: 'meta_primary_text', platform: 'meta', source: 'ai', status: 'draft' });
    expect(r.creatives[0]!.tags).toEqual(expect.arrayContaining(['fabrica', 'dor', 'variacao-vencedor']));
    expect(r.assets).toHaveLength(6);
    expect(r.creatives[0]!.assetIds).toHaveLength(2);
    expect(prompts[0]).toContain('<aprendizados>');
    expect(prompts[0]).toContain('<vencedor');
    const exp = getExperiment(ctx, org.id, r.experimentId!);
    expect(exp.variants.map((v) => v.label)).toEqual(['A · Café amargo', 'B · Clientes aprovam', 'C · Primeira compra']);
    expect(exp.primaryMetric).toBe('ctr');
  });

  it('sem chave do Gemini, cria os textos e explica a falta das imagens', async () => {
    const ctx = await makeTestContext({
      createTextProvider: () =>
        fakeProvider({ generateStructured: (async () => ({ data: { concepts: [concept('beneficio', 'Torra fresca', 'Torra semanal, sabor real.'), concept('novidade', 'Novo blend', 'Conheça o novo blend.')] }, model: 'm', usage: { inputTokens: 1, outputTokens: 1 } })) as never }),
    });
    const org = enableDemo(ctx, new Date('2026-10-09T12:00:00Z'));
    saveAiConfig(ctx, { model: 'm', apiKey: 'sk-ant-xyz-1234567890' });
    const projectId = ctx.db.get<{ id: string }>('SELECT id FROM projects WHERE organization_id = ? LIMIT 1', [org.id])!.id;
    const r = await runCreativeFactory(ctx, org.id, { projectId, angles: 2, createExperiment: false });
    expect(r.creatives).toHaveLength(2);
    expect(r.assets).toHaveLength(0);
    expect(r.experimentId).toBeNull();
    expect(r.notes.join(' ')).toMatch(/configure a chave do Gemini/);
  });
});
