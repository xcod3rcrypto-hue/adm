import { describe, expect, it, vi } from 'vitest';
import type { FetchLike } from '@advertex/advertising-core';
import { jsonResponse, makeTestContext } from '../testing';
import { createOrganization } from './organizations';
import { disconnect, listIntegrations, saveGoogle, saveMeta, syncAccounts, syncCampaigns, syncInsights, testMeta } from './integrations';
import { listCampaigns } from './campaigns';
import { dashboardSummary } from './dashboard';

const TOKEN = 'EAAtesteTOKENmeta1234567890abcdef';

function metaFetch(): FetchLike & ReturnType<typeof vi.fn> {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const u = new URL(url);
    expect(u.hostname).toBe('graph.facebook.com');
    expect(u.searchParams.get('access_token')).toBeNull();
    expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`);
    if (u.pathname.endsWith('/me')) return jsonResponse({ id: '42', name: 'Gestor' });
    if (u.pathname.endsWith('/me/adaccounts')) {
      return jsonResponse({ data: [{ account_id: '111', name: 'Conta BR', currency: 'BRL', timezone_name: 'America/Sao_Paulo', account_status: 1 }] });
    }
    if (u.pathname.endsWith('/act_111/campaigns')) {
      return jsonResponse({ data: [{ id: '900', name: 'Vendas', objective: 'OUTCOME_SALES', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '5000' }] });
    }
    if (u.pathname.endsWith('/act_111/insights')) {
      return jsonResponse({
        data: [
          {
            campaign_id: '900',
            date_start: '2026-10-01',
            account_currency: 'BRL',
            spend: '120.50',
            impressions: '10000',
            reach: '8000',
            clicks: '200',
            actions: [{ action_type: 'purchase', value: '5' }, { action_type: 'link_click', value: '190' }],
            action_values: [{ action_type: 'purchase', value: '600' }],
          },
          { campaign_id: '999', date_start: '2026-10-01', spend: '1' },
        ],
      });
    }
    return jsonResponse({ error: { message: 'rota inesperada' } }, 404);
  }) as never;
}

describe('integração Meta (com API simulada por mock)', () => {
  it('fluxo completo: salvar token → testar → contas → campanhas → métricas', async () => {
    const fetch = metaFetch();
    const ctx = await makeTestContext({ fetch });
    const org = createOrganization(ctx, { name: 'Org' });

    expect(listIntegrations(ctx, org.id)[0]).toMatchObject({ platform: 'meta', state: 'not_configured' });
    await expect(testMeta(ctx, org.id)).rejects.toThrow(/token de acesso/);

    const saved = saveMeta(ctx, org.id, { accessToken: TOKEN, apiVersion: 'v26.0' });
    expect(saved.state).toBe('configured');
    expect(saved.configuredFields).toEqual(['accessToken']);
    expect(JSON.stringify(saved)).not.toContain(TOKEN);

    expect((await testMeta(ctx, org.id)).state).toBe('connected');
    const [account] = await syncAccounts(ctx, org.id, 'meta');
    expect(account).toMatchObject({ remoteId: '111', currency: 'BRL', status: 'ACTIVE' });

    const r1 = await syncCampaigns(ctx, org.id, 'meta', account!.id);
    expect(r1).toMatchObject({ imported: 1, updated: 0 });
    const r2 = await syncCampaigns(ctx, org.id, 'meta', account!.id);
    expect(r2).toMatchObject({ imported: 0, updated: 1 }); // idempotente
    const [camp] = listCampaigns(ctx, org.id);
    expect(camp).toMatchObject({ remoteId: '900', dailyBudget: 50, syncState: 'synced', status: 'active' });

    const ins = await syncInsights(ctx, org.id, 'meta', account!.id, { from: '2026-10-01', to: '2026-10-01' });
    expect(ins.imported).toBe(1);
    expect(ins.message).toMatch(/ignorada/);
    await syncInsights(ctx, org.id, 'meta', account!.id, { from: '2026-10-01', to: '2026-10-01' });
    expect(ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM metric_snapshots')!.n).toBe(1);

    const s = dashboardSummary(ctx, org.id, '2026-10-01', '2026-10-01', null);
    expect(s.sources).toEqual(['meta']);
    expect(s.byCurrency[0]).toMatchObject({ currency: 'BRL', totals: { spend: 120.5, conversions: 5, revenue: 600 } });

    const after = await disconnect(ctx, org.id, 'meta');
    expect(after).toMatchObject({ state: 'not_configured', configuredFields: [], accounts: [] });
    expect(listCampaigns(ctx, org.id)).toHaveLength(1); // histórico preservado
  });

  it('marca erro e audita falha quando o token é inválido', async () => {
    const fetch = vi.fn(async () => jsonResponse({ error: { message: 'Invalid OAuth access token.', code: 190 } }, 400)) as never;
    const ctx = await makeTestContext({ fetch });
    const org = createOrganization(ctx, { name: 'Org' });
    saveMeta(ctx, org.id, { accessToken: TOKEN, apiVersion: 'v26.0' });
    await expect(testMeta(ctx, org.id)).rejects.toThrow(/inválido ou expirado/);
    const v = listIntegrations(ctx, org.id)[0]!;
    expect(v.state).toBe('error');
    expect(v.lastError).toMatch(/expirado/);
    const audit = ctx.db.get<{ outcome: string }>("SELECT outcome FROM audit_logs WHERE action = 'integration.meta.test'")!;
    expect(audit.outcome).toBe('failure');
  });
});

describe('integração Google (configuração)', () => {
  it('exige developer token e autorização antes de sincronizar', async () => {
    const ctx = await makeTestContext();
    const org = createOrganization(ctx, { name: 'Org' });
    await expect(syncAccounts(ctx, org.id, 'google')).rejects.toThrow(/Client ID/);
    saveGoogle(ctx, org.id, { clientId: '123.apps.googleusercontent.com', clientSecret: 'segredo-xyz', loginCustomerId: '', apiVersion: 'v25' });
    await expect(syncAccounts(ctx, org.id, 'google')).rejects.toThrow(/developer token/);
    saveGoogle(ctx, org.id, { developerToken: 'devtoken123', loginCustomerId: '1234567890', apiVersion: 'v25' });
    await expect(syncAccounts(ctx, org.id, 'google')).rejects.toThrow(/Autorize/);
    const g = listIntegrations(ctx, org.id)[1]!;
    expect(g.configuredFields.sort()).toEqual(['clientId', 'clientSecret', 'developerToken', 'loginCustomerId']);
  });
});
