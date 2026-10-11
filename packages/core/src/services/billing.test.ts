import { isoDay } from '@advertex/shared';
import { describe, expect, it, vi } from 'vitest';
import { jsonResponse, makeTestContext } from '../testing';
import { alertFor, daysLeftFrom, getBillingOverview, parseMoneyFromText } from './billing';
import { listCampaigns } from './campaigns';
import { enableDemo } from './demo';
import { saveGoogle, saveMeta, syncAccounts, syncCampaigns } from './integrations';
import { createOrganization } from './organizations';
import { putSecret, scopes } from './secrets';

function platforms() {
  const writes: string[] = [];
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === 'POST' && !url.includes('googleAds:search') && !url.includes('oauth2')) writes.push(url);
    if (url.startsWith('https://oauth2.googleapis.com/token')) return jsonResponse({ access_token: 'at', expires_in: 3600 });
    if (url.endsWith('customers:listAccessibleCustomers')) return jsonResponse({ resourceNames: ['customers/3333333333', 'customers/4444444444'] });
    if (url.includes('googleAds:search')) {
      const q = String(JSON.parse(String(init?.body)).query);
      const id = url.match(/customers\/(\d+)/)![1]!;
      if (q.includes('FROM customer ')) return jsonResponse({ results: [{ customer: { id, descriptiveName: `Google ${id}`, currencyCode: 'BRL', manager: false } }] });
      if (q.includes('FROM account_budget')) {
        if (id === '4444444444') return jsonResponse({ results: [] });
        return jsonResponse({
          results: [{ accountBudget: { id: '1', name: 'Mensal', status: 'APPROVED', approvedSpendingLimitMicros: '3000000000', amountServedMicros: '2650000000', totalAdjustmentsMicros: '0', approvedEndDateTime: '2099-12-31 23:59:59' } }],
        });
      }
      return jsonResponse({ results: [] });
    }
    const u = new URL(url);
    const path = u.pathname.replace(/^\/v26\.0\//, '');
    if (path === 'me/adaccounts') {
      return jsonResponse({ data: [{ id: 'act_111', account_id: '111', name: 'Pix', currency: 'BRL', account_status: 1 }, { id: 'act_222', account_id: '222', name: 'Cartão', currency: 'BRL', account_status: 1 }] });
    }
    if (path === 'act_111/campaigns') return jsonResponse({ data: [{ id: '900', name: 'Vendas', objective: 'OUTCOME_SALES', status: 'ACTIVE', daily_budget: '5000' }] });
    if (path === 'act_111') {
      return jsonResponse({ name: 'Pix', currency: 'BRL', account_status: 1, is_prepay_account: true, balance: '0', amount_spent: '421390', spend_cap: '0', funding_source_details: { type: 20, display_string: 'Saldo disponível (R$1.186,40 BRL)' } });
    }
    if (path === 'act_222') {
      return jsonResponse({ name: 'Cartão', currency: 'BRL', account_status: 1, is_prepay_account: false, balance: '31275', amount_spent: '987000', spend_cap: '1500000', funding_source_details: { type: 1, display_string: 'Visa •••• 4242' } });
    }
    return jsonResponse({ error: { message: `rota ${path}` } }, 404);
  });
  return { fetch, writes };
}

describe('saldo e pagamentos', () => {
  it('lê saldo, gasto, limite e forma de pagamento da Meta e orçamento do Google, sem escrever nada', async () => {
    const api = platforms();
    const ctx = await makeTestContext({ fetch: api.fetch as never });
    const org = createOrganization(ctx, { name: 'Org' });
    saveMeta(ctx, org.id, { accessToken: 'EAAB-token-de-teste-1234567890', apiVersion: 'v26.0' });
    saveGoogle(ctx, org.id, { clientId: '123.apps.googleusercontent.com', clientSecret: 'segredo-xyz', developerToken: 'devtoken123', loginCustomerId: '', apiVersion: 'v25' });
    putSecret(ctx, scopes.org(org.id, 'google', 'refreshToken'), org.id, 'refresh-1');
    const pix = (await syncAccounts(ctx, org.id, 'meta')).find((a) => a.name === 'Pix');
    await syncAccounts(ctx, org.id, 'google');
    await syncCampaigns(ctx, org.id, 'meta', pix!.id);
    const camp = listCampaigns(ctx, org.id)[0]!;
    // 7 dias de R$ 100 → média de R$ 100/dia.
    const now = new Date(ctx.now());
    for (let d = 1; d <= 7; d += 1) {
      ctx.db.run(
        `INSERT INTO metric_snapshots (id, organization_id, campaign_id, platform, date, currency, spend, source, fetched_at) VALUES (?, ?, ?, 'meta', ?, 'BRL', 100, 'meta', ?)`,
        [ctx.newId(), org.id, camp.id, isoDay(-d, now), ctx.now()],
      );
    }

    const o = await getBillingOverview(ctx, org.id);
    expect(api.writes).toEqual([]);
    const byName = Object.fromEntries(o.accounts.map((a) => [a.name, a]));

    const p = byName['Pix']!;
    expect(p).toMatchObject({ kind: 'prepaid', balance: 1186.4, amountSpent: 4213.9, spendCap: null, avgDailySpend7d: 100, error: null });
    expect(p.daysLeft).toBeCloseTo(11.9, 1);
    expect(p.alert).toBe('ok');
    expect(p.paymentUrl).toContain('business.facebook.com/billing_hub');
    expect(p.paymentUrl).toContain('asset_id=111');

    const c = byName['Cartão']!;
    expect(c).toMatchObject({ kind: 'card', balance: 312.75, amountSpent: 9870, spendCap: 15000, spendCapRemaining: 5130, fundingSource: 'Visa •••• 4242', avgDailySpend7d: null, daysLeft: null, alert: 'none' });

    const gb = byName['Google 3333333333']!;
    expect(gb).toMatchObject({ kind: 'budget', budget: { limit: 3000, served: 2650, remaining: 350 } });
    const gc = byName['Google 4444444444']!;
    expect(gc.kind).toBe('card');
    expect(gc.budget).toBeNull();
    expect(gc.notes.join(' ')).toMatch(/não informa saldo/);
  });

  it('erro em uma conta não derruba as outras', async () => {
    const api = platforms();
    const fetch = vi.fn(async (url: string, init?: RequestInit) => (url.includes('/act_222?') ? jsonResponse({ error: { message: 'Sem permissão' } }, 403) : api.fetch(url, init)));
    const ctx = await makeTestContext({ fetch: fetch as never });
    const org = createOrganization(ctx, { name: 'Org' });
    saveMeta(ctx, org.id, { accessToken: 'EAAB-token-de-teste-1234567890', apiVersion: 'v26.0' });
    await syncAccounts(ctx, org.id, 'meta');
    const o = await getBillingOverview(ctx, org.id);
    expect(o.accounts.find((a) => a.name === 'Pix')!.error).toBeNull();
    expect(o.accounts.find((a) => a.name === 'Cartão')!.error).toMatch(/Sem permissão/);
  });

  it('demonstração mostra os quatro tipos de conta sem chamar APIs', async () => {
    const fetch = vi.fn();
    const ctx = await makeTestContext({ fetch: fetch as never });
    const demo = enableDemo(ctx);
    const o = await getBillingOverview(ctx, demo.id);
    expect(o.accounts.map((a) => a.kind).sort()).toEqual(['budget', 'card', 'card', 'prepaid']);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('interpreta valores e previsões', () => {
    expect(parseMoneyFromText('Saldo disponível (R$1.234,56 BRL)')).toBe(1234.56);
    expect(parseMoneyFromText('Available balance ($1,234.50 USD)')).toBe(1234.5);
    expect(parseMoneyFromText('Saldo (R$ 50 BRL)')).toBe(50);
    expect(parseMoneyFromText('Visa')).toBeNull();
    expect(daysLeftFrom([300, 100], 50)).toBe(2);
    expect(daysLeftFrom([null], 50)).toBeNull();
    expect(daysLeftFrom([100], 0)).toBeNull();
    expect([alertFor(1), alertFor(4), alertFor(10), alertFor(null)]).toEqual(['critical', 'warning', 'ok', 'none']);
  });
});
