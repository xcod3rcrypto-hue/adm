import { describe, expect, it, vi } from 'vitest';
import { jsonResponse, makeTestContext } from '../testing';
import { storeAssetBuffer } from './assets';
import { createCampaignDraft } from './campaigns';
import { createCreative } from './creatives';
import { saveMeta, syncAccounts } from './integrations';
import { buildTargeting, createMetaAdSetFromCreatives, deleteMetaAdSet, listMetaAdSets, metaAssetsOptions, pushMetaAdSet, saveMetaAdSet } from './metaAds';
import { createOrganization } from './organizations';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

function metaApi(opts: { failAdOnce?: boolean } = {}) {
  const posts: Array<{ path: string; body: URLSearchParams }> = [];
  let adFails = opts.failAdOnce ? 1 : 0;
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    const u = new URL(url);
    const path = u.pathname.replace(/^\/v26\.0\//, '');
    if (init?.method === 'POST') {
      const body = new URLSearchParams(String(init.body));
      posts.push({ path, body });
      if (path === 'act_111/adimages') return jsonResponse({ images: { 'a.png': { hash: 'hash123' } } });
      if (path === 'act_111/adsets') return jsonResponse({ id: '5001' });
      if (path === 'act_111/adcreatives') return jsonResponse({ id: `700${posts.filter((p) => p.path === 'act_111/adcreatives').length}` });
      if (path === 'act_111/ads') {
        if (adFails > 0) {
          adFails -= 1;
          return jsonResponse({ error: { message: 'x', code: 100, error_user_title: 'Link inválido', error_user_msg: 'O link do anúncio não abre.' } }, 400);
        }
        return jsonResponse({ id: `900${posts.filter((p) => p.path === 'act_111/ads').length}` });
      }
    }
    if (path === 'me/adaccounts') return jsonResponse({ data: [{ id: 'act_111', account_id: '111', name: 'Conta', currency: 'BRL', account_status: 1 }] });
    if (path === 'act_111/promote_pages') return jsonResponse({ data: [{ id: '12345', name: 'Minha Página' }] });
    if (path === 'act_111/instagram_accounts') return jsonResponse({ data: [{ id: '67890', username: 'minhaloja' }] });
    if (path === 'act_111/adspixels') return jsonResponse({ error: { message: 'sem permissão', code: 200 } }, 403);
    if (path.endsWith('/adsets') || path.endsWith('/ads') || path.endsWith('/adcreatives')) return jsonResponse({ data: [] });
    return jsonResponse({ error: { message: `rota inesperada ${path}` } }, 404);
  });
  return { fetch, posts };
}

async function setup(api = metaApi()) {
  const ctx = await makeTestContext({ fetch: api.fetch as never });
  const org = createOrganization(ctx, { name: 'Org' });
  saveMeta(ctx, org.id, { accessToken: 'EAAB-token-de-teste-1234567890', apiVersion: 'v26.0' });
  const [account] = await syncAccounts(ctx, org.id, 'meta');
  const campaign = createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'Vendas', objective: 'OUTCOME_SALES', dailyBudget: 50 });
  ctx.db.run("UPDATE campaigns SET remote_id = '4001', advertising_account_id = ?, sync_state = 'synced' WHERE id = ?", [account!.id, campaign.id]);
  const asset = storeAssetBuffer(ctx, org.id, null, 'a.png', PNG, ['4:5']);
  const cr1 = createCreative(ctx, org.id, { title: 'Fábrica · Café fresco todo dia', kind: 'meta_primary_text', platform: 'meta', body: 'Cansado de café amargo?', assetIds: [asset.id] });
  const cr2 = createCreative(ctx, org.id, { title: 'Prova social', kind: 'meta_primary_text', platform: 'meta', body: '4.800 clientes aprovam.', assetIds: [asset.id] });
  return { ctx, org, campaign, asset, cr1, cr2, api };
}

describe('Meta: conjuntos e anúncios', () => {
  it('monta o público corretamente (Advantage+ e manual)', () => {
    expect(buildTargeting({ countries: ['BR'], ageMin: 30, ageMax: 50, gender: 'female', advantageAudience: true })).toEqual({
      geo_locations: { countries: ['BR'] },
      age_min: 25,
      targeting_automation: { advantage_audience: 1 },
      genders: [2],
    });
    expect(buildTargeting({ countries: ['BR', 'PT'], ageMin: 30, ageMax: 50, gender: 'all', advantageAudience: false })).toEqual({
      geo_locations: { countries: ['BR', 'PT'] },
      age_min: 30,
      age_max: 50,
      targeting_automation: { advantage_audience: 0 },
    });
  });

  it('rascunho → envio completo pausado, retomando após falha sem duplicar', async () => {
    const api = metaApi({ failAdOnce: true });
    const { ctx, org, campaign, asset, cr1, cr2 } = await setup(api);
    const opts = await metaAssetsOptions(ctx, org.id, campaign.id);
    expect(opts.pages).toEqual([{ id: '12345', name: 'Minha Página' }]);
    expect(opts.instagram[0]!.username).toBe('minhaloja');
    expect(opts.notes.join(' ')).toMatch(/Pixels/);

    let set = saveMetaAdSet(ctx, org.id, campaign.id, null, { name: 'Teste ângulos', ads: [{ creativeId: cr1.id, assetId: asset.id, headline: 'Café fresco' }] });
    expect(set.missing).toEqual(['Página do Facebook', 'Link de destino']);
    await expect(pushMetaAdSet(ctx, org.id, set.id)).rejects.toThrow(/Página do Facebook/);
    expect(() => saveMetaAdSet(ctx, org.id, campaign.id, set.id, { name: 'Teste', optimizationGoal: 'REACH' })).toThrow(/incompatível/);

    set = saveMetaAdSet(ctx, org.id, campaign.id, set.id, {
      name: 'Teste ângulos',
      pageId: '12345',
      instagramUserId: '67890',
      link: 'https://loja.example/cafe',
      cta: 'SHOP_NOW',
      ads: [
        { id: set.ads[0]!.id, creativeId: cr1.id, assetId: asset.id, headline: 'Café fresco' },
        { creativeId: cr2.id, assetId: asset.id, headline: 'Clientes aprovam' },
      ],
    });
    expect(set.missing).toEqual([]);

    await expect(pushMetaAdSet(ctx, org.id, set.id)).rejects.toThrow(/Link inválido: O link do anúncio não abre/);
    set = listMetaAdSets(ctx, org.id, campaign.id)[0]!;
    expect(set.syncState).toBe('error');
    expect(set.remoteId).toBe('5001');
    expect(set.ads[0]!.status).toBe('creative');

    set = await pushMetaAdSet(ctx, org.id, set.id);
    expect(set.syncState).toBe('synced');
    expect(set.ads.map((a) => a.status)).toEqual(['published', 'published']);
    // Um conjunto, uma imagem (reaproveitada), dois criativos e dois anúncios — nada duplicado.
    const count = (p: string) => api.posts.filter((x) => x.path === p).length;
    expect([count('act_111/adsets'), count('act_111/adimages'), count('act_111/adcreatives')]).toEqual([1, 1, 2]);

    const adset = api.posts.find((p) => p.path === 'act_111/adsets')!.body;
    expect(adset.get('status')).toBe('PAUSED');
    expect(adset.get('campaign_id')).toBe('4001');
    expect(adset.get('optimization_goal')).toBe('LANDING_PAGE_VIEWS');
    expect(adset.get('destination_type')).toBe('WEBSITE');
    expect(adset.get('daily_budget')).toBeNull(); // orçamento na campanha
    const story = JSON.parse(api.posts.find((p) => p.path === 'act_111/adcreatives')!.body.get('object_story_spec')!);
    expect(story).toMatchObject({
      page_id: '12345',
      instagram_user_id: '67890',
      link_data: { image_hash: 'hash123', link: 'https://loja.example/cafe', message: 'Cansado de café amargo?', name: 'Café fresco', call_to_action: { type: 'SHOP_NOW' } },
    });
    expect(api.posts.filter((p) => p.path === 'act_111/ads').every((p) => p.body.get('status') === 'PAUSED')).toBe(true);

    // Depois de enviado: público congelado, exclusão bloqueada.
    expect(() => saveMetaAdSet(ctx, org.id, campaign.id, set.id, { name: 'Teste ângulos', pageId: '12345', link: 'https://outra.example', ads: [] })).toThrow(/não mudam mais/);
    expect(() => deleteMetaAdSet(ctx, org.id, set.id)).toThrow(/já existe na Meta/);
  });

  it('cria o conjunto a partir dos criativos da Fábrica com as últimas escolhas', async () => {
    const { ctx, org, campaign, cr1, cr2, asset } = await setup();
    saveMetaAdSet(ctx, org.id, campaign.id, null, { name: 'Primeiro', pageId: '12345', link: 'https://loja.example', cta: 'LEARN_MORE', ads: [] });
    const set = createMetaAdSetFromCreatives(ctx, org.id, campaign.id, [cr1.id, cr2.id]);
    expect(set).toMatchObject({ pageId: '12345', link: 'https://loja.example', cta: 'LEARN_MORE', missing: [] });
    expect(set.ads.map((a) => [a.headline, a.assetId])).toEqual([
      ['Café fresco todo dia', asset.id],
      ['Prova social', asset.id],
    ]);
  });
});
