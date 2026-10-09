import { describe, expect, it, beforeEach } from 'vitest';
import type { AppContext } from '../context';
import { makeTestContext } from '../testing';
import { createOrganization, getActiveOrganization, listOrganizations } from './organizations';
import { dashboardSummary } from './dashboard';
import { disableDemo, enableDemo, findDemoOrganization } from './demo';
import { listCampaigns } from './campaigns';
import { saveMeta } from './integrations';

let ctx: AppContext;
beforeEach(async () => {
  ctx = await makeTestContext();
});

function insertMetric(orgId: string, campaignId: string, date: string, currency: string, spend: number, clicks: number, conversions: number, revenue: number | null = null) {
  ctx.db.run(
    `INSERT INTO metric_snapshots (id, organization_id, campaign_id, platform, date, currency, spend, impressions, reach, clicks, conversions, revenue, source, fetched_at)
     VALUES (?, ?, ?, 'meta', ?, ?, ?, ?, 100, ?, ?, ?, 'meta', '2026-10-01T00:00:00Z')`,
    [ctx.newId(), orgId, campaignId, date, currency, spend, clicks * 50, clicks, conversions, revenue],
  );
}

function insertCampaign(orgId: string, currency: string): string {
  const id = ctx.newId();
  ctx.db.run(
    "INSERT INTO campaigns (id, organization_id, platform, remote_id, name, objective, status, currency, sync_state, created_at, updated_at) VALUES (?, ?, 'meta', ?, ?, 'OUTCOME_SALES', 'active', ?, 'synced', 'n', 'n')",
    [id, orgId, id.slice(-6), `Campanha ${currency}`, currency],
  );
  return id;
}

describe('dashboard', () => {
  it('nunca soma moedas diferentes e calcula métricas derivadas', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const brl = insertCampaign(org.id, 'BRL');
    const usd = insertCampaign(org.id, 'USD');
    insertMetric(org.id, brl, '2026-10-01', 'BRL', 100, 20, 4, 400);
    insertMetric(org.id, brl, '2026-10-02', 'BRL', 100, 20, 1, 100);
    insertMetric(org.id, usd, '2026-10-01', 'USD', 50, 10, 2);

    const s = dashboardSummary(ctx, org.id, '2026-10-01', '2026-10-02', null);
    expect(s.isDemo).toBe(false);
    expect(s.sources).toEqual(['meta']);
    const b = s.byCurrency.find((x) => x.currency === 'BRL')!;
    expect(b.totals.spend).toBe(200);
    expect(b.totals.reach).toBeNull(); // alcance não é somável
    expect(b.derived.cpa).toBeCloseTo(40);
    expect(b.derived.roas).toBeCloseTo(2.5);
    expect(b.derived.ctr).toBeCloseTo(40 / 2000);
    expect(s.byCurrency.find((x) => x.currency === 'USD')!.derived.roas).toBeNull();
    expect(s.alerts.some((a) => a.message.includes('moedas diferentes'))).toBe(true);
  });

  it('compara com o período anterior e alerta aumento de CPA', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const c = insertCampaign(org.id, 'BRL');
    insertMetric(org.id, c, '2026-09-29', 'BRL', 100, 50, 20);
    insertMetric(org.id, c, '2026-09-30', 'BRL', 100, 50, 20);
    insertMetric(org.id, c, '2026-10-01', 'BRL', 150, 50, 10);
    insertMetric(org.id, c, '2026-10-02', 'BRL', 150, 50, 10);
    const s = dashboardSummary(ctx, org.id, '2026-10-01', '2026-10-02', null);
    expect(s.previous[0]!.totals.spend).toBe(200);
    expect(s.alerts.some((a) => a.level === 'warning' && a.message.includes('CPA'))).toBe(true);
  });

  it('informa ausência de dados sem inventar valores', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const s = dashboardSummary(ctx, org.id, '2026-10-01', '2026-10-07', null);
    expect(s.byCurrency).toEqual([]);
    expect(s.alerts[0]!.message).toMatch(/Nenhuma métrica/);
  });
});

describe('modo de demonstração', () => {
  it('cria organização separada marcada como demo e remove tudo ao desativar', () => {
    const real = createOrganization(ctx, { name: 'Real' });
    const demo = enableDemo(ctx, new Date('2026-10-08T12:00:00'));
    expect(demo.isDemo).toBe(true);
    expect(getActiveOrganization(ctx)?.id).toBe(demo.id);
    expect(listCampaigns(ctx, demo.id).length).toBeGreaterThan(0);
    expect(listCampaigns(ctx, real.id)).toHaveLength(0);

    const s = dashboardSummary(ctx, demo.id, '2026-09-09', '2026-10-08', null);
    expect(s.isDemo).toBe(true);
    expect(s.sources).toEqual(['demo']);
    expect(s.byCurrency[0]!.totals.spend).toBeGreaterThan(0);

    // Dados reais não recebem métricas demo
    expect(dashboardSummary(ctx, real.id, '2026-09-09', '2026-10-08', null).byCurrency).toEqual([]);

    // Integrações reais são bloqueadas na organização demo
    expect(() => saveMeta(ctx, demo.id, { apiVersion: 'v26.0', accessToken: 'x'.repeat(30) })).toThrow(/demonstração/);

    disableDemo(ctx);
    expect(findDemoOrganization(ctx)).toBeNull();
    expect(listOrganizations(ctx).map((o) => o.id)).toEqual([real.id]);
    expect(getActiveOrganization(ctx)?.id).toBe(real.id);
    expect(ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM metric_snapshots')!.n).toBe(0);
  });

  it('é idempotente', () => {
    const a = enableDemo(ctx);
    const b = enableDemo(ctx);
    expect(a.id).toBe(b.id);
  });
});
