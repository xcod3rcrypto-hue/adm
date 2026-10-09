import { describe, expect, it, vi } from 'vitest';
import { jsonResponse, makeTestContext } from '../testing';
import { createOrganization } from './organizations';
import { createProject } from './projects';
import { saveBrief } from './briefs';
import { listAssets } from './assets';
import { generateCreativeImages, getImageAiConfig, saveImageAiConfig, testImageAi } from './images';

const PNG_1x1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

describe('geração de imagens (Gemini)', () => {
  it('explica a falta de chave em vez de simular', async () => {
    const ctx = await makeTestContext();
    const org = createOrganization(ctx, { name: 'Org' });
    expect(getImageAiConfig(ctx)).toMatchObject({ model: 'gemini-3-pro-image-preview', hasApiKey: false });
    await expect(generateCreativeImages(ctx, org.id, { description: 'Antena no telhado de uma fazenda' })).rejects.toThrow(/chave da API do Gemini/);
  });

  it('gera, salva na biblioteca com tag e usa briefing e formato', async () => {
    const bodies: Array<{ url: string; key: string | undefined; body: { contents: Array<{ parts: Array<{ text?: string }> }>; generationConfig: { imageConfig: { aspectRatio: string; imageSize?: string } } } }> = [];
    const fetch = vi.fn(async (url: string, init?: RequestInit) => {
      bodies.push({ url, key: (init?.headers as Record<string, string>)['x-goog-api-key'], body: JSON.parse(String(init?.body)) });
      return jsonResponse({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'ok' }, { inlineData: { mimeType: 'image/png', data: PNG_1x1 } }] } }] });
    });
    const ctx = await makeTestContext({ fetch: fetch as never });
    saveImageAiConfig(ctx, { model: 'gemini-3-pro-image-preview', apiKey: 'AIza-teste-123456' });
    const org = createOrganization(ctx, { name: 'Org' });
    const p = createProject(ctx, org.id, { name: 'Starlink' });
    saveBrief(ctx, org.id, p.id, { productOrService: 'Internet via satélite', targetAudience: 'Produtores rurais' });
    const r = await generateCreativeImages(ctx, org.id, { projectId: p.id, description: 'Antena Starlink no telhado de uma fazenda ao pôr do sol', aspectRatio: '4:5', count: 2 });
    expect(r.assets).toHaveLength(1); // duas respostas idênticas: a biblioteca não duplica
    expect(r.assets[0]).toMatchObject({ mimeType: 'image/png', width: 1, height: 1, tags: ['ia-gemini', '4:5'], projectId: p.id });
    expect(bodies[0]!.url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent');
    expect(bodies[0]!.url).not.toContain('AIza');
    expect(bodies[0]!.key).toBe('AIza-teste-123456');
    expect(bodies[0]!.body.generationConfig.imageConfig).toEqual({ aspectRatio: '4:5', imageSize: '2K' });
    const prompt = bodies[0]!.body.contents[0]!.parts[0]!.text!;
    expect(prompt).toContain('Produtores rurais');
    expect(prompt).toContain('Não inclua textos');
    expect(listAssets(ctx, org.id, null, 'ia-gemini')).toHaveLength(1);
  });

  it('traduz erros de chave e recusas de conteúdo', async () => {
    const ctx = await makeTestContext({ fetch: (async () => jsonResponse({ error: { code: 400, message: 'API key not valid.' } }, 400)) as never });
    saveImageAiConfig(ctx, { model: 'gemini-3-pro-image-preview', apiKey: 'AIza-ruim-1234567' });
    await expect(testImageAi(ctx)).rejects.toThrow(/Chave da API do Gemini inválida/);

    const ctx2 = await makeTestContext({ fetch: (async () => jsonResponse({ promptFeedback: { blockReason: 'SAFETY' } })) as never });
    saveImageAiConfig(ctx2, { model: 'gemini-3-pro-image-preview', apiKey: 'AIza-ok-123456789' });
    const org = createOrganization(ctx2, { name: 'Org' });
    await expect(generateCreativeImages(ctx2, org.id, { description: 'descrição qualquer de teste' })).rejects.toThrow(/recusou o pedido \(SAFETY\)/);
  });
});
