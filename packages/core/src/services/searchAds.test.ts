import { describe, expect, it, vi } from 'vitest';
import type { FetchLike } from '@advertex/advertising-core';
import type { PageAnalysis } from '@advertex/shared';
import { fakeProvider, jsonResponse, makeTestContext } from '../testing';
import { createOrganization } from './organizations';
import { saveGoogle, syncAccounts } from './integrations';
import { putSecret, scopes } from './secrets';
import { createCampaignDraft } from './campaigns';
import { publishCampaign, listPlatformOperations } from './publishing';
import { saveAiConfig } from './ai';
import { createProject } from './projects';
import { saveBrief } from './briefs';
import { generateSearchAdFromPage, keywordIdeasFromAi, keywordIdeasFromGoogle, listSearchAdGroups, pushSearchAdGroup, saveSearchAdGroup } from './searchAds';

/** Google Ads simulado: MCC 1111111111 com a conta 2222222222. */
function fakeGoogle() {
  const state = { mutations: [] as Array<{ resource: string; body: { operations: Array<Record<string, unknown>> }; login: string | undefined }>, failKeywordsOnce: false, ideasForbidden: false };
  const fetch: FetchLike = async (url, init) => {
    if (url.startsWith('https://oauth2.googleapis.com/token')) return jsonResponse({ access_token: 'at', expires_in: 3600 });
    const login = (init?.headers as Record<string, string> | undefined)?.['login-customer-id'];
    const body = init?.body ? JSON.parse(String(init.body)) : {};
    if (url.endsWith('customers:listAccessibleCustomers')) return jsonResponse({ resourceNames: ['customers/1111111111'] });
    if (url.endsWith(':generateKeywordIdeas')) {
      if (state.ideasForbidden) return jsonResponse({ error: { code: 403, message: 'not allowed' } }, 403);
      return jsonResponse({
        results: [
          { text: 'internet starlink', keywordIdeaMetrics: { avgMonthlySearches: '12100', competition: 'HIGH', lowTopOfPageBidMicros: '1500000', highTopOfPageBidMicros: '4200000' } },
          { text: 'internet rural', keywordIdeaMetrics: { avgMonthlySearches: '8100', competition: 'MEDIUM' } },
        ],
      });
    }
    if (url.endsWith('googleAds:search')) {
      const q = String(body.query);
      if (q.includes('FROM customer_client')) return jsonResponse({ results: [{ customerClient: { id: '2222222222', descriptiveName: 'Starlink Anúncios', currencyCode: 'BRL', manager: false } }] });
      if (q.includes('FROM customer ')) return jsonResponse({ results: [{ customer: { id: '1111111111', descriptiveName: 'Starlink', currencyCode: 'BRL', manager: true } }] });
      return jsonResponse({ results: [] });
    }
    const m = /customers\/(\d+)\/(\w+):mutate$/.exec(url);
    if (m) {
      const resource = m[2]!;
      state.mutations.push({ resource, body, login });
      if (resource === 'adGroupCriteria' && state.failKeywordsOnce) {
        state.failKeywordsOnce = false;
        return jsonResponse({ error: { code: 400, message: 'bad', details: [{ errors: [{ errorCode: { criterionError: 'INVALID_KEYWORD_TEXT' }, message: 'Keyword inválida.' }] }] } }, 400);
      }
      const ids: Record<string, string> = { campaignBudgets: 'campaignBudgets/9', campaigns: 'campaigns/555', adGroups: 'adGroups/777', adGroupAds: 'adGroupAds/777~888' };
      const results = (body.operations as unknown[]).map((_, i) => ({ resourceName: `customers/${m[1]}/${ids[resource] ?? `${resource}/${i}`}` }));
      return jsonResponse({ results });
    }
    return jsonResponse({ error: { message: `rota inesperada ${url}` } }, 404);
  };
  return { state, fetch };
}

const ad = {
  finalUrl: 'https://loja.example/starlink',
  path1: 'Internet',
  path2: 'Rural',
  headlines: ['Internet Starlink', 'Internet Rural Rápida', 'Instalação Simples'],
  descriptions: ['Internet via satélite para qualquer lugar do Brasil. Peça já.', 'Conexão estável no campo. Fale com um especialista.'],
};

async function setup(extra: Partial<Parameters<typeof makeTestContext>[0]> = {}) {
  const g = fakeGoogle();
  const ctx = await makeTestContext({ fetch: g.fetch, ...extra });
  const org = createOrganization(ctx, { name: 'Org' });
  saveGoogle(ctx, org.id, { clientId: '123.apps.googleusercontent.com', clientSecret: 'segredo-xyz', developerToken: 'devtoken123', loginCustomerId: '', apiVersion: 'v25' });
  putSecret(ctx, scopes.org(org.id, 'google', 'refreshToken'), org.id, 'refresh-1');
  const accounts = await syncAccounts(ctx, org.id, 'google');
  const child = accounts.find((a) => a.remoteId === '2222222222')!;
  const project = createProject(ctx, org.id, { name: 'Starlink' });
  saveBrief(ctx, org.id, project.id, { productOrService: 'Internet via satélite Starlink', websiteUrl: 'https://loja.example/starlink' });
  const campaign = createCampaignDraft(ctx, org.id, { platform: 'google', name: 'Pesquisa Starlink', objective: 'SEARCH', dailyBudget: 50, currency: 'BRL', projectId: project.id });
  return { ctx, org, g, accounts, child, campaign };
}

describe('Rede de Pesquisa', () => {
  it('lista a conta filha da MCC e usa a MCC como login-customer-id', async () => {
    const { accounts } = await setup();
    expect(accounts.map((a) => a.name)).toEqual(['Starlink (MCC)', 'Starlink Anúncios']);
  });

  it('ideias do Planejador do Google ordenadas por volume, com lances', async () => {
    const { ctx, org, campaign } = await setup();
    const r = await keywordIdeasFromGoogle(ctx, org.id, campaign.id, { seeds: ['starlink'] });
    expect(r.ideas[0]).toMatchObject({ text: 'internet starlink', avgMonthlySearches: 12100, competition: 'HIGH', lowBid: 1.5, highBid: 4.2 });
    await expect(keywordIdeasFromGoogle(ctx, org.id, campaign.id, { seeds: [], url: '' })).resolves.toBeDefined(); // usa a URL do briefing
  });

  it('monta grupo, palavras-chave, negativas e anúncio; retoma após falha sem duplicar', async () => {
    const { ctx, org, g, child, campaign } = await setup();
    await publishCampaign(ctx, org.id, campaign.id, child.id);
    expect(g.state.mutations.every((m) => m.login === '1111111111')).toBe(true);

    const group = saveSearchAdGroup(ctx, org.id, campaign.id, null, {
      name: 'Internet Rural',
      cpcBid: 2.5,
      keywords: [{ text: 'internet starlink', matchType: 'EXACT' }, { text: 'internet rural' }],
      negativeKeywords: ['grátis', 'emprego'],
      ad,
    });
    expect(group.syncState).toBe('local_only');

    g.state.failKeywordsOnce = true;
    await expect(pushSearchAdGroup(ctx, org.id, group.id)).rejects.toThrow(/Google Ads recusou ao adicionar palavras-chave: Keyword inválida/);
    const partial = listSearchAdGroups(ctx, org.id, campaign.id)[0]!;
    expect(partial).toMatchObject({ remoteId: '777', syncState: 'error', steps: { adGroup: true, keywords: false } });

    const done = await pushSearchAdGroup(ctx, org.id, group.id);
    expect(done).toMatchObject({ syncState: 'synced', steps: { adGroup: true, keywords: true, negatives: true, ad: true } });
    expect(done.ad.remoteId).toBe('888');
    const byResource = (r: string) => g.state.mutations.filter((m) => m.resource === r);
    expect(byResource('adGroups')).toHaveLength(1); // não recriou o grupo
    expect(byResource('adGroups')[0]!.body.operations[0]).toMatchObject({ create: { type: 'SEARCH_STANDARD', cpcBidMicros: '2500000', campaign: 'customers/2222222222/campaigns/555' } });
    expect(byResource('adGroupCriteria').at(-1)!.body.operations).toHaveLength(2);
    expect(byResource('campaignCriteria')[0]!.body.operations[0]).toMatchObject({ create: { negative: true, keyword: { text: 'grátis', matchType: 'PHRASE' } } });
    const rsa = byResource('adGroupAds')[0]!.body.operations[0] as { create: { ad: { finalUrls: string[]; responsiveSearchAd: { headlines: unknown[]; path1: string } } } };
    expect(rsa.create.ad.finalUrls).toEqual(['https://loja.example/starlink']);
    expect(rsa.create.ad.responsiveSearchAd.headlines).toHaveLength(3);
    expect(listPlatformOperations(ctx, org.id, campaign.id).map((o) => o.operation)).toContain('createResponsiveSearchAd');
    expect(() => saveSearchAdGroup(ctx, org.id, campaign.id, group.id, { name: 'X grupo', keywords: [{ text: 'a' }], ad })).toThrow(/já foi enviado/);
  });

  it('valida limites e exige campanha publicada para enviar', async () => {
    const { ctx, org, campaign } = await setup();
    expect(() => saveSearchAdGroup(ctx, org.id, campaign.id, null, { name: 'Grupo', keywords: [{ text: 'a' }], ad: { ...ad, headlines: ['Título muito longo que passa de trinta', 'B título', 'C título'] } })).toThrow(/Título 1 \(38\/30\)/);
    expect(() => saveSearchAdGroup(ctx, org.id, campaign.id, null, { name: 'Grupo', keywords: [{ text: 'internet!' }], ad })).toThrow(/símbolos/);
    expect(() => saveSearchAdGroup(ctx, org.id, campaign.id, null, { name: 'Grupo', keywords: [{ text: 'a' }], ad: { ...ad, headlines: ['Igual', 'igual', 'Outro'] } })).toThrow(/diferentes/);
    const g = saveSearchAdGroup(ctx, org.id, campaign.id, null, { name: 'Grupo', keywords: [{ text: 'internet' }], ad });
    await expect(pushSearchAdGroup(ctx, org.id, g.id)).rejects.toThrow(/Publique a campanha/);
  });

  it('gera anúncio completo a partir da página, descarta textos longos e anexa volumes do Google', async () => {
    const generateStructured = vi.fn(async (req: { prompt: string }) => {
      if (!req.prompt.includes('Crie um anúncio')) {
        return { data: { keywords: [{ text: 'antena starlink', matchType: 'PHRASE', intent: 'compra' }], negatives: ['grátis'] }, model: 'm', usage: { inputTokens: 1, outputTokens: 1 } };
      }
      expect(req.prompt).toContain('<pagina url="https://loja.example/starlink">');
      return {
        data: {
          headlines: ['Internet Starlink', 'Internet Rural Rápida', 'Este título é longo demais para o Google', 'Peça Já a Sua'],
          descriptions: ['Internet via satélite para qualquer lugar. Peça já.', 'Conexão estável no campo. Fale com especialista.'],
          path1: 'Internet Rural',
          path2: 'Starlink',
          keywords: [{ text: 'internet starlink', matchType: 'EXACT', intent: 'compra' }, { text: 'internet, rural!', matchType: 'PHRASE', intent: 'pesquisa' }],
          negatives: ['grátis', 'emprego'],
          strategy: 'Foco em conectividade rural.',
        },
        model: 'm',
        usage: { inputTokens: 1, outputTokens: 1 },
      };
    });
    const { ctx, org, campaign } = await setup({ createTextProvider: () => fakeProvider({ generateStructured: generateStructured as never }) });
    saveAiConfig(ctx, { model: 'm', apiKey: 'sk-ant-xyz-1234567890' });
    const page: PageAnalysis = { url: 'https://loja.example/starlink', finalUrl: 'https://loja.example/starlink', fetchedAt: 'n', status: 200, title: 'Starlink', description: 'Internet via satélite', headings: [], textExcerpt: '...' };
    const d = await generateSearchAdFromPage(ctx, org.id, campaign.id, page, []);
    expect(d.headlines).toEqual(['Internet Starlink', 'Internet Rural Rápida', 'Peça Já a Sua']);
    expect(d.path1).toBe('InternetRural');
    expect(d.keywords.map((k) => k.text)).toEqual(['internet starlink', 'internet rural']);
    expect(d.keywords[0]).toMatchObject({ avgMonthlySearches: 12100, suggestedMatchType: 'EXACT' });
    expect(d.notes.join(' ')).toMatch(/1 texto\(s\) acima do limite/);

    const ai = await keywordIdeasFromAi(ctx, org.id, campaign.id, ['starlink']);
    expect(ai).toMatchObject({ source: 'ai', negatives: ['grátis'] });
    expect(ai.ideas[0]).toMatchObject({ text: 'antena starlink', suggestedMatchType: 'PHRASE' });
  });
});
