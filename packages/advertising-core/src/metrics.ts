import type { DerivedMetrics, MetricTotals } from '@advertex/shared';

export interface MetricRow {
  date: string;
  currency: string;
  spend: number;
  impressions: number;
  reach: number | null;
  clicks: number;
  conversions: number;
  revenue: number | null;
}

export const emptyTotals = (): MetricTotals => ({ spend: 0, impressions: 0, reach: null, clicks: 0, conversions: 0, revenue: null });

/**
 * Soma linhas da MESMA moeda. Alcance não é aditivo entre dias/campanhas
 * (pessoas se repetem), então só é mantido quando há uma única linha.
 */
export function sumRows(rows: MetricRow[]): MetricTotals {
  const currencies = new Set(rows.map((r) => r.currency));
  if (currencies.size > 1) throw new Error('sumRows: não é permitido somar métricas de moedas diferentes.');
  const t = emptyTotals();
  for (const r of rows) {
    t.spend += r.spend;
    t.impressions += r.impressions;
    t.clicks += r.clicks;
    t.conversions += r.conversions;
    if (r.revenue !== null) t.revenue = (t.revenue ?? 0) + r.revenue;
  }
  t.reach = rows.length === 1 ? (rows[0]?.reach ?? null) : null;
  return t;
}

const ratio = (a: number | null, b: number | null): number | null => (a === null || b === null || b === 0 ? null : a / b);

export function deriveMetrics(t: MetricTotals): DerivedMetrics {
  return {
    ctr: ratio(t.clicks, t.impressions),
    cpm: t.impressions === 0 ? null : (t.spend / t.impressions) * 1000,
    cpc: ratio(t.spend, t.clicks),
    cpa: ratio(t.spend, t.conversions),
    roas: t.revenue === null ? null : ratio(t.revenue, t.spend),
  };
}

export function groupBy<T, K extends string>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const it of items) {
    const k = key(it);
    const list = m.get(k);
    if (list) list.push(it);
    else m.set(k, [it]);
  }
  return m;
}

/** Variação relativa entre dois períodos; null quando a base é zero. */
export function relativeChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return (current - previous) / previous;
}
