import { describe, expect, it } from 'vitest';
import { diagnose, volumeConfidence, type CampaignInfo, type DailyRow } from './diagnostics';

const camp = (id: string, extra: Partial<CampaignInfo> = {}): CampaignInfo => ({ id, name: `Campanha ${id}`, platform: 'meta', currency: 'BRL', dailyBudget: null, ...extra });

function days(from: string, n: number): string[] {
  const out: string[] = [];
  const d = new Date(`${from}T00:00:00Z`);
  for (let i = 0; i < n; i += 1) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function rows(campaignId: string, from: string, n: number, fn: (i: number) => Partial<DailyRow>): DailyRow[] {
  return days(from, n).map((date, i) => ({
    campaignId,
    date,
    currency: 'BRL',
    spend: 100,
    impressions: 10_000,
    reach: null,
    clicks: 150,
    conversions: 5,
    revenue: 600,
    ...fn(i),
  }));
}

const period = { from: '2026-09-15', to: '2026-09-28' };
const prevFrom = '2026-09-01';

describe('diagnose', () => {
  it('não gera achados para uma campanha estável', () => {
    const r = diagnose({ campaigns: [camp('a')], current: rows('a', period.from, 14, () => ({})), previous: rows('a', prevFrom, 14, () => ({})), period });
    expect(r).toEqual([]);
  });

  it('detecta aumento de CPA com volume suficiente e traz evidências', () => {
    const r = diagnose({
      campaigns: [camp('a')],
      current: rows('a', period.from, 14, () => ({ spend: 200 })),
      previous: rows('a', prevFrom, 14, () => ({})),
      period,
    });
    const f = r.find((d) => d.kind === 'cpa_increase');
    expect(f).toBeDefined();
    expect(f!.severity).toBe('critical');
    expect(f!.evidence.map((e) => e.label)).toContain('CPA atual');
    expect(f!.confidence).toBeGreaterThan(0.5);
    expect(f!.recommendation.limitations).toMatch(/agregada/);
  });

  it('não compara CPA quando há poucas conversões', () => {
    const r = diagnose({
      campaigns: [camp('a')],
      current: rows('a', period.from, 14, () => ({ spend: 300, conversions: 0.5, revenue: null })),
      previous: rows('a', prevFrom, 14, () => ({ conversions: 0.5, revenue: null })),
      period,
    });
    expect(r.find((d) => d.kind === 'cpa_increase')).toBeUndefined();
  });

  it('detecta queda de conversões', () => {
    const r = diagnose({ campaigns: [camp('a')], current: rows('a', period.from, 14, () => ({ conversions: 2 })), previous: rows('a', prevFrom, 14, () => ({})), period });
    expect(r.map((d) => d.kind)).toContain('conversion_drop');
  });

  it('detecta gasto acima do orçamento diário', () => {
    const r = diagnose({ campaigns: [camp('a', { dailyBudget: 50 })], current: rows('a', period.from, 14, () => ({})), previous: [], period });
    const f = r.find((d) => d.kind === 'overspend');
    expect(f?.recommendation.action).toEqual({ type: 'adjust_budget', changePercent: -50 });
  });

  it('detecta possível falha de rastreamento (gasto sem conversões no fim)', () => {
    const r = diagnose({ campaigns: [camp('a')], current: rows('a', period.from, 14, (i) => ({ conversions: i >= 11 ? 0 : 5 })), previous: [], period });
    expect(r[0]?.kind).toBe('tracking_issue');
    expect(r[0]?.severity).toBe('critical');
  });

  it('sinaliza possível fadiga quando o CTR cai entre o início e o fim do período', () => {
    const r = diagnose({ campaigns: [camp('a')], current: rows('a', period.from, 14, (i) => ({ clicks: i < 7 ? 200 : 100 })), previous: [], period });
    const f = r.find((d) => d.kind === 'creative_fatigue');
    expect(f).toBeDefined();
    expect(f!.title).toMatch(/Possível/);
  });

  it('detecta pico de gasto anômalo', () => {
    const r = diagnose({ campaigns: [camp('a')], current: rows('a', period.from, 14, (i) => ({ spend: i === 5 ? 900 : 100 + (i % 3) })), previous: [], period });
    expect(r.map((d) => d.kind)).toContain('spend_anomaly');
  });

  it('detecta ROAS abaixo de 1', () => {
    const r = diagnose({ campaigns: [camp('a')], current: rows('a', period.from, 14, () => ({ revenue: 40 })), previous: [], period });
    expect(r.map((d) => d.kind)).toContain('low_roas');
  });

  it('aponta oportunidade de escala só comparando campanhas na mesma moeda', () => {
    const current = [...rows('a', period.from, 14, () => ({ spend: 50 })), ...rows('b', period.from, 14, () => ({ spend: 200 }))];
    const r = diagnose({ campaigns: [camp('a'), camp('b')], current, previous: [], period });
    const f = r.find((d) => d.kind === 'scale_opportunity');
    expect(f?.campaignId).toBe('a');
    expect(f?.severity).toBe('opportunity');
  });

  it('ordena por severidade', () => {
    const current = [...rows('a', period.from, 14, (i) => ({ conversions: i >= 11 ? 0 : 5 })), ...rows('b', period.from, 14, () => ({ spend: 50 })), ...rows('c', period.from, 14, () => ({ spend: 200 }))];
    const r = diagnose({ campaigns: [camp('a'), camp('b'), camp('c')], current, previous: [], period });
    const sev = r.map((d) => d.severity);
    expect(sev.indexOf('critical')).toBeLessThan(sev.indexOf('opportunity'));
  });
});

describe('volumeConfidence', () => {
  it('cresce com o volume e nunca chega a 1', () => {
    expect(volumeConfidence(0, 50)).toBe(0.1);
    expect(volumeConfidence(10, 50)).toBeLessThan(volumeConfidence(40, 50));
    expect(volumeConfidence(10_000, 50)).toBe(0.95);
  });
});
