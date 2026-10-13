import { describe, expect, it, vi } from 'vitest';
import { jsonResponse, makeTestContext } from '../testing';
import { createCampaignDraft, listCampaigns } from './campaigns';
import { saveMeta, syncAccounts, syncCampaigns } from './integrations';
import { getMetaRemoteStructure } from './metaAds';
import { createOrganization } from './organizations';

function meta(opts: { campaigns: unknown[]; archived?: number; permissions?: string[] }) {
  const urls: string[] = [];
  const fetch = vi.fn(async (url: string) => {
    urls.push(url);
    const u = new URL(url);
    const path = u.pathname.replace(/^\/v26\.0\//, '');
    if (path === 'me/adaccounts') return jsonResponse({ data: [{ id: 'act_111', account_id: '111', name: 'Conta', currency: 'BRL', account_status: 1 }] });
    if (path === 'me/permissions') return jsonResponse({ data: (opts.permissions ?? ['ads_read']).map((p) => ({ permission: p, status: 'granted' })) });
    if (path === 'me') return jsonResponse({ id: '42', name: 'Usuário do sistema' });
    if (path === 'act_111') return jsonResponse({ account_status: 1 });
    if (path === 'act_111/campaigns') {
      if (u.searchParams.get('effective_status') === '["ARCHIVED"]') return jsonResponse({ data: Array.from({ length: opts.archived ?? 0 }, (_, i) => ({ id: `a${i}` })) });
      return jsonResponse({ data: opts.campaigns });
    }
    if (path === '900/adsets') return jsonResponse({ data: [{ id: '700', name: 'Público frio', effective_status: 'ACTIVE', daily_budget: '5000', optimization_goal: 'OFFSITE_CONVERSIONS' }] });
    if (path === '900/ads') {
      return jsonResponse({ data: [{ id: '800', name: 'Anúncio 1', effective_status: 'ACTIVE', adset_id: '700', creative: { title: 'Oferta', body: 'Compre hoje', thumbnail_url: 'https://scontent.fbcdn.net/x.jpg' } }] });
    }
    return jsonResponse({ error: { message: `rota ${path}` } }, 404);
  });
  return { fetch, urls };
}

async function setup(api: ReturnType<typeof meta>) {
  const ctx = await makeTestContext({ fetch: api.fetch as never });
  const org = createOrganization(ctx, { name: 'Org' });
  saveMeta(ctx, org.id, { accessToken: 'EAAB-token-de-teste-1234567890', apiVersion: 'v26.0' });
  const [account] = await syncAccounts(ctx, org.id, 'meta');
  return { ctx, org, account: account! };
}

describe('importação de campanhas da Meta', () => {
  it('pede todos os status de campanha (exceto excluídas) e importa', async () => {
    const api = meta({ campaigns: [{ id: '900', name: 'Vendas', objective: 'OUTCOME_SALES', status: 'ACTIVE', effective_status: 'WITH_ISSUES' }] });
    const { ctx, org, account } = await setup(api);
    const r = await syncCampaigns(ctx, org.id, 'meta', account.id);
    expect(r.imported).toBe(1);
    const q = new URL(api.urls.find((x) => x.includes('act_111/campaigns'))!);
    const statuses = JSON.parse(q.searchParams.get('effective_status')!) as string[];
    expect(statuses).toEqual(expect.arrayContaining(['ACTIVE', 'PAUSED', 'WITH_ISSUES', 'PENDING_BILLING_INFO', 'ARCHIVED']));
    expect(statuses).not.toContain('DELETED');
  });

  it('explica por que vieram 0 campanhas: arquivadas, permissão ou atribuição da conta', async () => {
    let s = await setup(meta({ campaigns: [], archived: 3 }));
    expect((await syncCampaigns(s.ctx, s.org.id, 'meta', s.account.id)).message).toMatch(/3 campanha\(s\) arquivada/);

    s = await setup(meta({ campaigns: [], permissions: ['public_profile'] }));
    expect((await syncCampaigns(s.ctx, s.org.id, 'meta', s.account.id)).message).toMatch(/não tem a permissão ads_read/);

    s = await setup(meta({ campaigns: [] }));
    const m = (await syncCampaigns(s.ctx, s.org.id, 'meta', s.account.id)).message;
    expect(m).toMatch(/Atribuir ativos/);
    expect(m).toMatch(/Usuário do sistema \(42\)/);
  });

  it('lista conjuntos e anúncios que já existem na campanha', async () => {
    const api = meta({ campaigns: [{ id: '900', name: 'Vendas', objective: 'OUTCOME_SALES', status: 'ACTIVE' }] });
    const { ctx, org, account } = await setup(api);
    await syncCampaigns(ctx, org.id, 'meta', account.id);
    const c = listCampaigns(ctx, org.id)[0]!;
    const r = await getMetaRemoteStructure(ctx, org.id, c.id);
    expect(r.adSets).toEqual([{ id: '700', name: 'Público frio', status: 'ACTIVE', dailyBudget: 50, optimizationGoal: 'OFFSITE_CONVERSIONS' }]);
    expect(r.ads[0]).toMatchObject({ id: '800', adSetId: '700', title: 'Oferta', body: 'Compre hoje', imageUrl: 'https://scontent.fbcdn.net/x.jpg' });
    // Rascunho local (sem ID na Meta) não chama a API.
    const draft = createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'Rascunho', objective: 'OUTCOME_SALES', dailyBudget: 10, currency: 'BRL' } as never);
    const before = api.urls.length;
    expect(await getMetaRemoteStructure(ctx, org.id, draft.id)).toMatchObject({ adSets: [], ads: [] });
    expect(api.urls.length).toBe(before);
  });
});
