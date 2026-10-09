import { describe, expect, it, vi } from 'vitest';
import { fakeProvider, jsonResponse, makeTestContext } from '../testing';
import { saveAiConfig, generateVariations } from './ai';
import { generatePlaybook, getBrainReport, learningsFor, setUseLearnings, syncAdPerformance, tagCreativesWithAi } from './brain';
import { enableDemo } from './demo';
import { saveMeta, syncAccounts } from './integrations';
import { createOrganization } from './organizations';

describe('cérebro criativo', () => {
  it('na demonstração, descobre padrões, ranqueia anúncios e alimenta a geração', async () => {
    const prompts: string[] = [];
    const ctx = await makeTestContext({
      createTextProvider: () =>
        fakeProvider({
          generateStructured: (async (req: { prompt: string }) => {
            prompts.push(req.prompt);
            if (req.prompt.includes('playbook')) return { data: { summary: 'Perguntas sobre a dor funcionam.', rules: ['Abra com pergunta', 'Mostre prova social', 'Evite excesso de emojis'] }, model: 'm', usage: { inputTokens: 1, outputTokens: 1 } };
            return { data: { variations: [{ text: 'Cansado de café amargo?', rationale: 'dor' }] }, model: 'm', usage: { inputTokens: 1, outputTokens: 1 } };
          }) as never,
        }),
    });
    const org = enableDemo(ctx, new Date('2026-10-09T12:00:00Z'));
    const r = getBrainReport(ctx, org.id);
    expect(r.totals.ads).toBe(18);
    expect(r.pendingAiTagging).toBe(0);
    const q = r.patterns.find((p) => p.feature === 'pergunta' && p.metric === 'ctr');
    expect(q).toMatchObject({ value: 'sim', direction: 'positive' });
    expect(r.winners).toHaveLength(5);
    expect(r.losers).toHaveLength(5);
    expect(r.limitations.at(-1)).toMatch(/Associação não é causa/);

    // Filtro por plataforma.
    expect(getBrainReport(ctx, org.id, { platform: 'google' }).totals.ads).toBe(4);

    saveAiConfig(ctx, { model: 'm', apiKey: 'sk-ant-xyz-1234567890' });
    const pb = await generatePlaybook(ctx, org.id);
    expect(pb.playbook?.rules).toContain('Abra com pergunta');
    expect(prompts[0]).toContain('<vencedores>');

    const learn = learningsFor(ctx, org.id);
    expect(learn).toMatch(/pergunta/);
    expect(learn).toContain('Abra com pergunta');

    const projectId = ctx.db.get<{ id: string }>('SELECT id FROM projects WHERE organization_id = ? LIMIT 1', [org.id])!.id;
    await generateVariations(ctx, org.id, { projectId, kind: 'meta_primary_text', funnelStage: 'conversion', count: 1 });
    expect(prompts.at(-1)).toContain('<aprendizados>');

    setUseLearnings(ctx, org.id, false);
    expect(learningsFor(ctx, org.id)).toBe('');
  });

  it('importa desempenho por anúncio da Meta e classifica com IA', async () => {
    const fetch = vi.fn(async (url: string) => {
      const u = new URL(url);
      if (u.pathname.endsWith('/me/adaccounts')) return jsonResponse({ data: [{ id: 'act_111', account_id: '111', name: 'Conta', currency: 'BRL', timezone_name: 'America/Sao_Paulo', account_status: 1 }] });
      if (u.pathname.endsWith('/act_111/insights')) {
        expect(u.searchParams.get('level')).toBe('ad');
        return jsonResponse({
          data: [
            { ad_id: '1', ad_name: 'A', campaign_id: '900', adset_id: '50', account_currency: 'BRL', spend: '100', impressions: '10000', clicks: '200', actions: [{ action_type: 'purchase', value: '5' }] },
            { ad_id: '2', ad_name: 'B', campaign_id: '900', adset_id: '50', account_currency: 'BRL', spend: '80', impressions: '9000', clicks: '90' },
          ],
        });
      }
      if (u.pathname === '/v26.0/' && u.searchParams.get('ids') === '1,2') {
        return jsonResponse({
          '1': { id: '1', effective_status: 'ACTIVE', creative: { object_story_spec: { link_data: { name: 'Café fresco?', message: 'Torra semanal', call_to_action: { type: 'SHOP_NOW' }, picture: 'https://cdn.example/a.jpg' } } } },
          '2': { id: '2', effective_status: 'PAUSED', creative: { title: 'Grãos especiais', body: 'Frete grátis' } },
        });
      }
      return jsonResponse({ error: { message: 'rota inesperada ' + u.pathname } }, 404);
    });
    const ctx = await makeTestContext({
      fetch: fetch as never,
      createTextProvider: () =>
        fakeProvider({
          generateStructured: (async (req: { prompt: string }) => {
            const ids = [...req.prompt.matchAll(/<anuncio id="(\d+)">/g)].map((m) => m[1]!);
            return { data: { items: ids.map((id) => ({ id, angulo: 'beneficio', emocao: 'desejo', tom: 'direto', gancho: 'pergunta' })) }, model: 'm', usage: { inputTokens: 1, outputTokens: 1 } };
          }) as never,
        }),
    });
    const org = createOrganization(ctx, { name: 'Org' });
    saveMeta(ctx, org.id, { accessToken: 'EAAB-token-de-teste-1234567890', apiVersion: 'v26.0' });
    const [account] = await syncAccounts(ctx, org.id, 'meta');
    const res = await syncAdPerformance(ctx, org.id, 'meta', { accountId: account!.id, days: 30 }, new Date('2026-10-09T12:00:00Z'));
    expect(res.imported).toBe(2);
    expect(res.message).toMatch(/2026-09-09 a 2026-10-08/);
    let r = getBrainReport(ctx, org.id);
    expect(r.pendingAiTagging).toBe(2);
    expect(r.winners.map((w) => w.remoteAdId)).toEqual(['1', '2']); // CTR 2% > 1%
    expect(r.losers).toEqual([]);
    saveAiConfig(ctx, { model: 'm', apiKey: 'sk-ant-xyz-1234567890' });
    expect(await tagCreativesWithAi(ctx, org.id)).toMatchObject({ tagged: 2, remaining: 0 });
    r = getBrainReport(ctx, org.id);
    expect(r.pendingAiTagging).toBe(0);
    const row = ctx.db.get<{ headline: string; cta: string; image_url: string; status: string }>("SELECT headline, cta, image_url, status FROM ad_performance WHERE remote_ad_id = '1'")!;
    expect(row).toEqual({ headline: 'Café fresco?', cta: 'SHOP_NOW', image_url: 'https://cdn.example/a.jpg', status: 'ACTIVE' });
    // Reimportar substitui o retrato da conta (sem duplicar).
    await syncAdPerformance(ctx, org.id, 'meta', { accountId: account!.id, days: 30 }, new Date('2026-10-09T12:00:00Z'));
    expect(ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM ad_performance')!.n).toBe(2);
  });
});
