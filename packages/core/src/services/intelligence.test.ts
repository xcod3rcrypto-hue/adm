import { beforeEach, describe, expect, it } from 'vitest';
import type { AppContext } from '../context';
import { makeTestContext } from '../testing';
import { createOrganization } from './organizations';
import { createCampaignDraft } from './campaigns';
import { enableDemo } from './demo';
import { getIntelligence, runDiagnostics, setRecommendationStatus } from './intelligence';
import { listAudit } from './audit';

let ctx: AppContext;
beforeEach(async () => {
  ctx = await makeTestContext();
});

function seed(organizationId: string, campaignId: string, from: string, n: number, f: (i: number) => { spend: number; conversions: number }) {
  const d = new Date(`${from}T00:00:00Z`);
  for (let i = 0; i < n; i += 1) {
    const v = f(i);
    ctx.db.run(
      `INSERT INTO metric_snapshots (id, organization_id, campaign_id, platform, date, currency, spend, impressions, reach, clicks, conversions, revenue, source, definition, fetched_at)
       VALUES (?, ?, ?, 'meta', ?, 'BRL', ?, 10000, NULL, 150, ?, NULL, 'meta', '', ?)`,
      [ctx.newId(), organizationId, campaignId, d.toISOString().slice(0, 10), v.spend, v.conversions, ctx.now()],
    );
    d.setUTCDate(d.getUTCDate() + 1);
  }
}

describe('inteligência', () => {
  it('gera insights e recomendações rastreáveis, preservando a decisão do usuário', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const c = createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'Vendas', objective: 'OUTCOME_SALES', dailyBudget: 100 });
    seed(org.id, c.id, '2026-09-01', 14, () => ({ spend: 100, conversions: 5 }));
    seed(org.id, c.id, '2026-09-15', 14, () => ({ spend: 200, conversions: 5 }));

    const report = runDiagnostics(ctx, org.id, '2026-09-15', '2026-09-28');
    expect(report.isDemo).toBe(false);
    expect(report.period).toEqual({ from: '2026-09-15', to: '2026-09-28' });
    expect(report.sources).toEqual(['meta']);
    const kinds = report.insights.map((i) => i.kind);
    expect(kinds).toContain('cpa_increase');
    expect(kinds).toContain('overspend');
    expect(report.insights[0]!.campaignName).toBe('Vendas');
    expect(report.recommendations.length).toBe(report.insights.length);

    const rec = report.recommendations.find((r) => r.action?.type === 'adjust_budget')!;
    setRecommendationStatus(ctx, org.id, rec.id, 'dismissed');

    // Reexecutar substitui os insights, mas mantém o status da recomendação.
    const again = runDiagnostics(ctx, org.id, '2026-09-15', '2026-09-28');
    expect(again.insights.length).toBe(report.insights.length);
    expect(again.recommendations.find((r) => r.id === rec.id)?.status).toBe('dismissed');
    expect(listAudit(ctx, org.id, 20).map((a) => a.action)).toContain('intelligence.run');
  });

  it('isola organizações', () => {
    const a = createOrganization(ctx, { name: 'A' });
    const b = createOrganization(ctx, { name: 'B' });
    const c = createCampaignDraft(ctx, a.id, { platform: 'meta', name: 'Campanha X', objective: 'OUTCOME_SALES', dailyBudget: 10 });
    seed(a.id, c.id, '2026-09-15', 14, () => ({ spend: 100, conversions: 5 }));
    runDiagnostics(ctx, a.id, '2026-09-15', '2026-09-28');
    expect(getIntelligence(ctx, b.id).insights).toEqual([]);
    const recA = getIntelligence(ctx, a.id).recommendations[0]!;
    expect(() => setRecommendationStatus(ctx, b.id, recA.id, 'done')).toThrow(/não encontrada/);
  });

  it('identifica dados de demonstração', () => {
    const demo = enableDemo(ctx, new Date('2026-10-01T12:00:00Z'));
    const r = runDiagnostics(ctx, demo.id, '2026-09-02', '2026-10-01');
    expect(r.isDemo).toBe(true);
    expect(r.sources).toEqual(['demo']);
    expect(r.limitations[0]).toMatch(/FICTÍCIOS/);
  });

  it('rejeita período invertido', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    expect(() => runDiagnostics(ctx, org.id, '2026-09-28', '2026-09-01')).toThrow(/Período inválido/);
  });
});
