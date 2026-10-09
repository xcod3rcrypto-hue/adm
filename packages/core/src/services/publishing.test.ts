import { describe, expect, it } from 'vitest';
import type { FetchLike } from '@advertex/advertising-core';
import { jsonResponse, makeTestContext } from '../testing';
import { createOrganization } from './organizations';
import { saveMeta, syncAccounts } from './integrations';
import { createCampaignDraft, getCampaign, updateCampaignDraft } from './campaigns';
import { enableDemo } from './demo';
import { listAudit } from './audit';
import {
  listPlatformOperations,
  preflightPublish,
  publishCampaign,
  savePublishingLimits,
  setCampaignRemoteStatus,
  updateCampaignRemoteBudget,
} from './publishing';

const TOKEN = 'EAAtesteTOKENmeta1234567890abcdef';

/** Graph API simulada com estado: campanhas criadas, falhas programáveis. */
function fakeMeta() {
  const state = {
    campaigns: [] as Array<{ id: string; name: string; status: string; daily_budget: string }>,
    failNext: null as null | 'network' | 'server' | 'reject',
    applyBeforeFailing: false,
    posts: 0,
  };
  const fetch: FetchLike = async (url, init) => {
    const u = new URL(url);
    if (u.pathname.endsWith('/me/adaccounts')) return jsonResponse({ data: [{ account_id: '111', name: 'Conta BR', currency: 'BRL' }] });
    if (init?.method === 'POST') {
      state.posts += 1;
      const body = new URLSearchParams(String(init.body));
      const fail = state.failNext;
      state.failNext = null;
      if (fail === 'reject') return jsonResponse({ error: { code: 100, message: 'Parâmetro inválido' } }, 400);
      if (u.pathname.endsWith('/act_111/campaigns')) {
        if (!fail || state.applyBeforeFailing) state.campaigns.push({ id: String(5000 + state.campaigns.length), name: body.get('name')!, status: body.get('status')!, daily_budget: body.get('daily_budget')! });
        if (fail === 'network') throw new TypeError('fetch failed');
        if (fail === 'server') return jsonResponse({ error: { code: 2, message: 'Erro temporário' } }, 500);
        return jsonResponse({ id: state.campaigns.at(-1)!.id });
      }
      const id = u.pathname.split('/').pop()!;
      const c = state.campaigns.find((x) => x.id === id);
      if (!c) return jsonResponse({ error: { code: 100, message: 'objeto inexistente' } }, 400);
      if (body.get('status')) c.status = body.get('status')!;
      if (body.get('daily_budget')) c.daily_budget = body.get('daily_budget')!;
      return jsonResponse({ success: true });
    }
    if (u.pathname.endsWith('/act_111/campaigns')) {
      const filter = JSON.parse(u.searchParams.get('filtering') ?? '[]') as Array<{ value: string }>;
      return jsonResponse({ data: state.campaigns.filter((c) => !filter[0] || c.name === filter[0].value) });
    }
    return jsonResponse({ error: { message: 'rota inesperada' } }, 404);
  };
  return { state, fetch };
}

async function setup() {
  const meta = fakeMeta();
  const ctx = await makeTestContext({ fetch: meta.fetch });
  const org = createOrganization(ctx, { name: 'Org' });
  saveMeta(ctx, org.id, { accessToken: TOKEN, apiVersion: 'v26.0' });
  const [account] = await syncAccounts(ctx, org.id, 'meta');
  const draft = createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'Vendas Outubro', objective: 'OUTCOME_SALES', dailyBudget: 80, currency: 'BRL' });
  return { ctx, org, account: account!, draft, meta };
}

describe('publicação controlada', () => {
  it('checklist aponta o que impede a publicação', async () => {
    const { ctx, org, account } = await setup();
    const semOrcamento = createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'Sem orçamento', objective: 'OUTCOME_SALES', currency: 'USD' });
    const check = preflightPublish(ctx, org.id, semOrcamento.id, account.id);
    expect(check.ok).toBe(false);
    const failed = check.items.filter((i) => !i.ok).map((i) => i.label);
    expect(failed).toEqual(['Moeda compatível', 'Orçamento diário definido']);
    await expect(publishCampaign(ctx, org.id, semOrcamento.id, account.id)).rejects.toThrow(/Publicação bloqueada/);
  });

  it('publica pausada, grava o ID remoto e não duplica ao repetir', async () => {
    const { ctx, org, account, draft, meta } = await setup();
    const published = await publishCampaign(ctx, org.id, draft.id, account.id);
    expect(published).toMatchObject({ remoteId: '5000', status: 'paused', syncState: 'synced', accountName: 'Conta BR' });
    expect(meta.state.campaigns).toEqual([{ id: '5000', name: 'Vendas Outubro', status: 'PAUSED', daily_budget: '8000' }]);
    await expect(publishCampaign(ctx, org.id, draft.id, account.id)).rejects.toThrow(/Já existe na plataforma/);
    expect(meta.state.campaigns).toHaveLength(1);
    expect(() => updateCampaignDraft(ctx, org.id, draft.id, { platform: 'meta', name: 'Outro nome', objective: 'OUTCOME_SALES' })).toThrow(/já existem na plataforma/);
    const ops = listPlatformOperations(ctx, org.id, draft.id);
    expect(ops[0]).toMatchObject({ operation: 'createCampaign', status: 'succeeded', remoteId: '5000' });
  });

  it('resultado incerto: verifica o estado remoto antes de repetir a criação', async () => {
    const { ctx, org, account, draft, meta } = await setup();
    meta.state.failNext = 'network';
    meta.state.applyBeforeFailing = true; // a plataforma criou, mas a resposta se perdeu
    await expect(publishCampaign(ctx, org.id, draft.id, account.id)).rejects.toThrow(/Resultado incerto/);
    expect(getCampaign(ctx, org.id, draft.id).syncState).toBe('pending');
    expect(listPlatformOperations(ctx, org.id, draft.id)[0]!.status).toBe('unknown');

    const postsBefore = meta.state.posts;
    const ok = await publishCampaign(ctx, org.id, draft.id, account.id);
    expect(ok.remoteId).toBe('5000');
    expect(meta.state.posts).toBe(postsBefore); // nenhuma nova criação: encontrada por verificação
    expect(meta.state.campaigns).toHaveLength(1);
    expect(listAudit(ctx, org.id, 50).map((a) => a.action)).toContain('platform.createCampaign.verified');
  });

  it('erro 5xx sem criação remota: verifica, não encontra e tenta de novo', async () => {
    const { ctx, org, account, draft, meta } = await setup();
    meta.state.failNext = 'server';
    await expect(publishCampaign(ctx, org.id, draft.id, account.id)).rejects.toThrow(/Resultado incerto/);
    const ok = await publishCampaign(ctx, org.id, draft.id, account.id);
    expect(ok.syncState).toBe('synced');
    expect(meta.state.campaigns).toHaveLength(1);
  });

  it('recusa definitiva marca erro e mantém o rascunho editável', async () => {
    const { ctx, org, account, draft, meta } = await setup();
    meta.state.failNext = 'reject';
    await expect(publishCampaign(ctx, org.id, draft.id, account.id)).rejects.toThrow(/Parâmetro inválido/);
    const c = getCampaign(ctx, org.id, draft.id);
    expect(c.syncState).toBe('error');
    expect(c.lastError).toMatch(/Parâmetro inválido/);
    expect(updateCampaignDraft(ctx, org.id, draft.id, { platform: 'meta', name: 'Vendas Outubro v2', objective: 'OUTCOME_SALES', dailyBudget: 80 }).name).toBe('Vendas Outubro v2');
    expect(listPlatformOperations(ctx, org.id)[0]!.status).toBe('failed');
  });

  it('ativa, pausa e ajusta orçamento respeitando os limites', async () => {
    const { ctx, org, account, draft, meta } = await setup();
    await publishCampaign(ctx, org.id, draft.id, account.id);
    expect((await setCampaignRemoteStatus(ctx, org.id, draft.id, 'active')).status).toBe('active');
    expect(meta.state.campaigns[0]!.status).toBe('ACTIVE');

    savePublishingLimits(ctx, org.id, { maxDailyBudget: 200, maxBudgetIncreasePercent: 50 });
    await expect(updateCampaignRemoteBudget(ctx, org.id, draft.id, 150)).rejects.toThrow(/Aumento de 88%/);
    await expect(updateCampaignRemoteBudget(ctx, org.id, draft.id, 250)).rejects.toThrow(/excede o limite/);
    expect(meta.state.campaigns[0]!.daily_budget).toBe('8000');
    const updated = await updateCampaignRemoteBudget(ctx, org.id, draft.id, 110);
    expect(updated.dailyBudget).toBe(110);
    expect(meta.state.campaigns[0]!.daily_budget).toBe('11000');

    // Mesma chave de idempotência: não chama a plataforma de novo.
    const posts = meta.state.posts;
    await setCampaignRemoteStatus(ctx, org.id, draft.id, 'paused', { idempotencyKey: 'k1' });
    await setCampaignRemoteStatus(ctx, org.id, draft.id, 'paused', { idempotencyKey: 'k1' });
    expect(meta.state.posts).toBe(posts + 1);
  });

  it('organização de demonstração nunca publica', async () => {
    const ctx = await makeTestContext();
    const demo = enableDemo(ctx);
    const c = ctx.db.get<{ id: string }>('SELECT id FROM campaigns WHERE organization_id = ? LIMIT 1', [demo.id])!;
    expect(preflightPublish(ctx, demo.id, c.id, null).items[0]).toMatchObject({ label: 'Organização real', ok: false });
    await expect(setCampaignRemoteStatus(ctx, demo.id, c.id, 'paused')).rejects.toThrow(/ainda não existe na plataforma/);
  });
});
