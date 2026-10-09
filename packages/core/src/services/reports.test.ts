import { beforeEach, describe, expect, it } from 'vitest';
import type { AppContext } from '../context';
import { makeTestContext } from '../testing';
import { createOrganization } from './organizations';
import { createProject } from './projects';
import { createCampaignDraft } from './campaigns';
import { enableDemo } from './demo';
import { runDiagnostics } from './intelligence';
import { createReport, deleteReport, getReport, listReports, reportToCsv, reportToHtml } from './reports';

let ctx: AppContext;
beforeEach(async () => {
  ctx = await makeTestContext();
});

function seed(organizationId: string, campaignId: string, dates: string[], spend: number, conversions: number) {
  for (const date of dates) {
    ctx.db.run(
      `INSERT INTO metric_snapshots (id, organization_id, campaign_id, platform, date, currency, spend, impressions, reach, clicks, conversions, revenue, source, definition, fetched_at)
       VALUES (?, ?, ?, 'meta', ?, 'BRL', ?, 1000, NULL, 20, ?, 300, 'meta', '', ?)`,
      [ctx.newId(), organizationId, campaignId, date, spend, conversions, ctx.now()],
    );
  }
}

describe('relatórios', () => {
  it('gera fotografia do período com resumo, comparação e filtro por projeto', () => {
    const org = createOrganization(ctx, { name: 'Agência' });
    const p = createProject(ctx, org.id, { name: 'Projeto A' });
    const a = createCampaignDraft(ctx, org.id, { platform: 'meta', name: '=Campanha A', objective: 'OUTCOME_SALES', projectId: p.id });
    const b = createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'Campanha B', objective: 'OUTCOME_SALES' });
    seed(org.id, a.id, ['2026-09-01', '2026-09-02'], 50, 2);
    seed(org.id, a.id, ['2026-09-03', '2026-09-04'], 100, 5);
    seed(org.id, b.id, ['2026-09-03'], 999, 1);

    const r = createReport(ctx, org.id, { title: 'Setembro — Projeto A', projectId: p.id, from: '2026-09-03', to: '2026-09-04' });
    expect(r.content.projectName).toBe('Projeto A');
    expect(r.content.campaigns.map((c) => c.name)).toEqual(['=Campanha A']);
    expect(r.content.byCurrency[0]!.totals.spend).toBe(200);
    expect(r.content.byCurrency[0]!.previous!.totals.spend).toBe(100);
    expect(r.content.executiveSummary.join(' ')).toMatch(/investimento \+100,0%/);

    // Fotografia: novas métricas não alteram relatórios já gerados.
    ctx.db.run("UPDATE metric_snapshots SET spend = spend + 1 WHERE campaign_id = ? AND date = '2026-09-04'", [a.id]);
    expect(getReport(ctx, org.id, r.id).content.byCurrency[0]!.totals.spend).toBe(200);
    expect(listReports(ctx, org.id)).toHaveLength(1);

    const csv = reportToCsv(r);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain("'=Campanha A;Meta Ads;BRL;200,00;2000;40;2,00");
    const html = reportToHtml(r);
    expect(html).toContain('Resumo executivo');
    expect(html).not.toMatch(/<script/i);
    expect(html).toContain('default-src \'none\'');

    deleteReport(ctx, org.id, r.id);
    expect(listReports(ctx, org.id)).toEqual([]);
  });

  it('marca relatórios de demonstração e inclui recomendações abertas', () => {
    const demo = enableDemo(ctx, new Date('2026-10-01T12:00:00'));
    runDiagnostics(ctx, demo.id, '2026-09-02', '2026-10-01');
    const r = createReport(ctx, demo.id, { title: 'Demo', from: '2026-09-02', to: '2026-10-01' });
    expect(r.content.isDemo).toBe(true);
    expect(r.content.limitations[0]).toMatch(/DEMONSTRAÇÃO/);
    expect(r.content.recommendations.length).toBeGreaterThan(0);
    expect(reportToHtml(r)).toContain('DEMONSTRAÇÃO');
    expect(reportToCsv(r)).toContain('DADOS FICTÍCIOS');
  });

  it('valida período e isola organizações', () => {
    const a = createOrganization(ctx, { name: 'A' });
    const b = createOrganization(ctx, { name: 'B' });
    expect(() => createReport(ctx, a.id, { title: 'X relatório', from: '2026-09-10', to: '2026-09-01' })).toThrow(/posterior/);
    const r = createReport(ctx, a.id, { title: 'Relatório A', from: '2026-09-01', to: '2026-09-10' });
    expect(() => getReport(ctx, b.id, r.id)).toThrow(/não encontrado/);
    expect(r.content.executiveSummary[0]).toMatch(/Não há métricas/);
  });
});
