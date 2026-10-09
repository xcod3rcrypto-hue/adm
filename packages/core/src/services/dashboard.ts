import type { DashboardSummary, MetricSource, Platform } from '@advertex/shared';
import { deriveMetrics, groupBy, relativeChange, sumRows, type MetricRow } from '@advertex/advertising-core';
import type { AppContext } from '../context';
import { bool, requireOrg } from '../util';

export interface SnapshotRow extends MetricRow {
  campaign_id: string;
  campaign_name: string;
  platform: Platform;
  source: MetricSource;
  fetched_at: string;
}

export function shiftDay(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1;
}

/** Período imediatamente anterior, de mesma duração. */
export function previousPeriod(from: string, to: string): { from: string; to: string } {
  const span = Math.max(daysBetween(from, to), 1);
  const prevTo = shiftDay(from, -1);
  return { from: shiftDay(prevTo, -(span - 1)), to: prevTo };
}

export function loadSnapshots(ctx: AppContext, organizationId: string, from: string, to: string, platform: Platform | null): SnapshotRow[] {
  const params: string[] = [organizationId, from, to];
  let extra = '';
  if (platform) {
    extra = ' AND m.platform = ?';
    params.push(platform);
  }
  return ctx.db.all<SnapshotRow>(
    `SELECT m.date, m.currency, m.spend, m.impressions, m.reach, m.clicks, m.conversions, m.revenue, m.platform, m.source, m.fetched_at,
            m.campaign_id, c.name AS campaign_name
     FROM metric_snapshots m JOIN campaigns c ON c.id = m.campaign_id
     WHERE m.organization_id = ? AND m.date BETWEEN ? AND ?${extra}
     ORDER BY m.date ASC`,
    params,
  );
}

const byCurrency = (rows: SnapshotRow[]) =>
  [...groupBy(rows, (r) => r.currency)].map(([currency, list]) => {
    const totals = sumRows(list);
    return { currency, totals, derived: deriveMetrics(totals) };
  });

export function dashboardSummary(ctx: AppContext, organizationId: string, from: string, to: string, platform: Platform | null): DashboardSummary {
  const org = requireOrg(ctx, organizationId);
  const { from: prevFrom, to: prevTo } = previousPeriod(from, to);

  const rows = loadSnapshots(ctx, organizationId, from, to, platform);
  const prevRows = loadSnapshots(ctx, organizationId, prevFrom, prevTo, platform);

  const current = byCurrency(rows);
  const previous = byCurrency(prevRows);

  const series = [...groupBy(rows, (r) => r.currency)].map(([currency, list]) => ({
    currency,
    points: [...groupBy(list, (r) => r.date)].map(([date, day]) => {
      const t = sumRows(day);
      return { date, spend: t.spend, clicks: t.clicks, conversions: t.conversions, impressions: t.impressions };
    }),
  }));

  const byPlatform = [...groupBy(rows, (r) => `${r.platform}|${r.currency}`)].map(([key, list]) => {
    const [p, currency] = key.split('|') as [Platform, string];
    const totals = sumRows(list);
    return { platform: p, currency, totals, derived: deriveMetrics(totals) };
  });

  const topCampaigns = [...groupBy(rows, (r) => r.campaign_id)]
    .map(([campaignId, list]) => {
      const totals = sumRows(list);
      return { campaignId, name: list[0]!.campaign_name, platform: list[0]!.platform, currency: list[0]!.currency, totals, derived: deriveMetrics(totals) };
    })
    .sort((a, b) => b.totals.spend - a.totals.spend)
    .slice(0, 8);

  const alerts: DashboardSummary['alerts'] = [];
  if (rows.length === 0) {
    alerts.push({ level: 'info', message: 'Nenhuma métrica no período selecionado.' });
  }
  if (current.length > 1) {
    alerts.push({ level: 'info', message: 'Há contas em moedas diferentes: os totais são exibidos separadamente por moeda, sem conversão.' });
  }
  for (const c of current) {
    const p = previous.find((x) => x.currency === c.currency);
    if (!p) continue;
    const spendChange = relativeChange(c.totals.spend, p.totals.spend);
    if (spendChange !== null && spendChange > 0.5) {
      alerts.push({ level: 'warning', message: `Investimento em ${c.currency} subiu ${(spendChange * 100).toFixed(0)}% em relação ao período anterior.` });
    }
    const cpaChange = relativeChange(c.derived.cpa, p.derived.cpa);
    if (cpaChange !== null && cpaChange > 0.3 && c.totals.conversions >= 10) {
      alerts.push({ level: 'warning', message: `CPA em ${c.currency} aumentou ${(cpaChange * 100).toFixed(0)}% versus o período anterior.` });
    }
    const convChange = relativeChange(c.totals.conversions, p.totals.conversions);
    if (convChange !== null && convChange < -0.3 && p.totals.conversions >= 10) {
      alerts.push({ level: 'warning', message: `Conversões em ${c.currency} caíram ${Math.abs(convChange * 100).toFixed(0)}% versus o período anterior.` });
    }
  }
  // Gasto sem conversões nos últimos 3 dias do período: possível falha de rastreamento.
  const tail = rows.filter((r) => r.date >= shiftDay(to, -2));
  for (const [currency, list] of groupBy(tail, (r) => r.currency)) {
    const t = sumRows(list);
    const hadBefore = rows.some((r) => r.currency === currency && r.date < shiftDay(to, -2) && r.conversions > 0);
    if (t.spend > 0 && t.conversions === 0 && hadBefore) {
      alerts.push({ level: 'warning', message: `Sem conversões registradas nos últimos 3 dias (${currency}) apesar de haver investimento — verifique pixel/tag de conversão.` });
    }
  }

  const sources = [...new Set(rows.map((r) => r.source))];
  const lastSyncedAt = rows.reduce<string | null>((acc, r) => (acc === null || r.fetched_at > acc ? r.fetched_at : acc), null);

  return {
    isDemo: bool(org.is_demo),
    sources,
    byCurrency: current,
    previous,
    series,
    byPlatform,
    topCampaigns,
    alerts,
    period: { from, to },
    lastSyncedAt,
  };
}
