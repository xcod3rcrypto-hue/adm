import { describe, expect, it, vi } from 'vitest';
import { jsonResponse, makeTestContext } from '../testing';
import { getCampaign, listCampaigns } from './campaigns';
import { saveMeta, syncAccounts, syncAllCampaigns, syncCampaigns } from './integrations';
import { createOrganization } from './organizations';
import { deleteCampaignRemote, removeCampaignLocal } from './publishing';

function meta(state: { deleted900?: boolean } = {}) {
  const posts: Array<{ path: string; body: string }> = [];
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    const path = new URL(url).pathname.replace(/^\/v26\.0\//, '');
    if (init?.method === 'POST') {
      posts.push({ path, body: String(init.body) });
      return jsonResponse({ success: true });
    }
    if (path === 'me/adaccounts') return jsonResponse({ data: [{ id: 'act_111', account_id: '111', name: 'Conta', currency: 'BRL', account_status: 1 }] });
    if (path === 'act_111/campaigns') {
      return jsonResponse({
        data: [
          ...(state.deleted900 ? [] : [{ id: '900', name: 'Vendas Verão', objective: 'OUTCOME_SALES', status: 'ACTIVE', daily_budget: '5000' }]),
          { id: '901', name: 'Leads', objective: 'OUTCOME_LEADS', status: 'PAUSED', daily_budget: '3000' },
        ],
      });
    }
    return jsonResponse({ error: { message: `rota ${path}` } }, 404);
  });
  return { fetch, posts };
}

describe('excluir campanhas publicadas', () => {
  it('exclui na plataforma com confirmação pelo nome e mantém o histórico', async () => {
    const api = meta();
    const ctx = await makeTestContext({ fetch: api.fetch as never });
    const org = createOrganization(ctx, { name: 'Org' });
    saveMeta(ctx, org.id, { accessToken: 'EAAB-token-de-teste-1234567890', apiVersion: 'v26.0' });
    const [account] = await syncAccounts(ctx, org.id, 'meta');
    await syncCampaigns(ctx, org.id, 'meta', account!.id);
    const c = listCampaigns(ctx, org.id).find((x) => x.remoteId === '900')!;

    await expect(deleteCampaignRemote(ctx, org.id, c.id, 'Vendas')).rejects.toThrow(/nome exato/);
    expect(api.posts).toHaveLength(0);
    const after = await deleteCampaignRemote(ctx, org.id, c.id, 'Vendas Verão');
    expect(after.status).toBe('removed');
    expect(api.posts).toEqual([{ path: '900', body: 'status=DELETED' }]);
    // Repetir não chama a API de novo (idempotente).
    await deleteCampaignRemote(ctx, org.id, c.id, 'Vendas Verão');
    expect(api.posts).toHaveLength(1);
  });

  it('remover só do app não altera a plataforma e a sincronização não traz de volta', async () => {
    const api = meta();
    const ctx = await makeTestContext({ fetch: api.fetch as never });
    const org = createOrganization(ctx, { name: 'Org' });
    saveMeta(ctx, org.id, { accessToken: 'EAAB-token-de-teste-1234567890', apiVersion: 'v26.0' });
    const [account] = await syncAccounts(ctx, org.id, 'meta');
    await syncCampaigns(ctx, org.id, 'meta', account!.id);
    const c = listCampaigns(ctx, org.id).find((x) => x.remoteId === '901')!;
    removeCampaignLocal(ctx, org.id, c.id);
    expect(() => getCampaign(ctx, org.id, c.id)).toThrow(/não encontrada/);
    await syncCampaigns(ctx, org.id, 'meta', account!.id);
    expect(listCampaigns(ctx, org.id).map((x) => x.remoteId)).toEqual(['900']);
    expect(api.posts).toHaveLength(0);
  });

  it('campanha excluída direto na plataforma é marcada como removida na sincronização (ao vivo)', async () => {
    const state = { deleted900: false };
    const api = meta(state);
    const ctx = await makeTestContext({ fetch: api.fetch as never });
    const org = createOrganization(ctx, { name: 'Org' });
    saveMeta(ctx, org.id, { accessToken: 'EAAB-token-de-teste-1234567890', apiVersion: 'v26.0' });
    await syncAccounts(ctx, org.id, 'meta');
    expect((await syncAllCampaigns(ctx, org.id)).accounts).toBe(1);
    expect(listCampaigns(ctx, org.id).every((c) => c.status !== 'removed')).toBe(true);
    state.deleted900 = true;
    const r = await syncAllCampaigns(ctx, org.id);
    expect(r.errors).toEqual([]);
    expect(listCampaigns(ctx, org.id).find((c) => c.remoteId === '900')!.status).toBe('removed');
    expect(listCampaigns(ctx, org.id).find((c) => c.remoteId === '901')!.status).toBe('paused');
  });
});
