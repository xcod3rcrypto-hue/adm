import { describe, expect, it } from 'vitest';
import { evaluateExperiment, normalCdf, twoProportionZ, twoSidedP, type VariantData } from './experiments';

const v = (id: string, d: Partial<VariantData>): VariantData => ({ id, label: id.toUpperCase(), impressions: 0, clicks: 0, conversions: 0, spend: 0, ...d });
const at = '2026-10-01T00:00:00.000Z';

describe('estatística', () => {
  it('normalCdf e p-valor batem com valores de referência', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(twoSidedP(1.96)).toBeCloseTo(0.05, 3);
  });

  it('teste z de proporções: 2% vs 3% em 10 mil impressões é significativo', () => {
    const z = twoProportionZ(200, 10_000, 300, 10_000)!;
    expect(z).toBeGreaterThan(4);
  });
});

describe('evaluateExperiment', () => {
  it('declara vencedor com significância em CTR', () => {
    const r = evaluateExperiment('ctr', [v('a', { impressions: 10_000, clicks: 200 }), v('b', { impressions: 10_000, clicks: 300 })], at);
    expect(r.outcome).toBe('winner');
    expect(r.winnerId).toBe('b');
    expect(r.comparisons[0]!.lift).toBeCloseTo(0.5, 5);
  });

  it('é inconclusivo quando a diferença não é significativa', () => {
    const r = evaluateExperiment('ctr', [v('a', { impressions: 2000, clicks: 40 }), v('b', { impressions: 2000, clicks: 44 })], at);
    expect(r.outcome).toBe('inconclusive');
    expect(r.reason).toMatch(/significativa/);
  });

  it('é inconclusivo e explica quando falta volume', () => {
    const r = evaluateExperiment('conversion_rate', [v('a', { clicks: 50, conversions: 2 }), v('b', { clicks: 500, conversions: 50 })], at);
    expect(r.outcome).toBe('inconclusive');
    expect(r.reason).toMatch(/Volume insuficiente em "A"/);
    expect(r.variants[0]!.sampleOk).toBe(false);
  });

  it('CPA: menor custo por conversão vence', () => {
    const r = evaluateExperiment('cpa', [v('a', { conversions: 100, spend: 10_000 }), v('b', { conversions: 160, spend: 10_000 })], at);
    expect(r.outcome).toBe('winner');
    expect(r.winnerId).toBe('b');
    expect(r.comparisons[0]!.lift).toBeLessThan(0);
  });

  it('controle vence quando todas as alternativas são piores', () => {
    const r = evaluateExperiment('ctr', [v('a', { impressions: 10_000, clicks: 300 }), v('b', { impressions: 10_000, clicks: 200 })], at);
    expect(r.winnerId).toBe('a');
  });

  it('aplica correção de Bonferroni com várias variantes', () => {
    // p ≈ 0,04 passaria com 2 variantes, mas não com 3 (limiar 0,025).
    const r = evaluateExperiment('ctr', [v('a', { impressions: 10_000, clicks: 200 }), v('b', { impressions: 10_000, clicks: 241 }), v('c', { impressions: 10_000, clicks: 205 })], at);
    expect(r.comparisons[0]!.pValue!).toBeGreaterThan(0.025);
    expect(r.comparisons[0]!.pValue!).toBeLessThan(0.05);
    expect(r.outcome).toBe('inconclusive');
  });

  it('exige ao menos duas variantes', () => {
    expect(evaluateExperiment('ctr', [v('a', { impressions: 5000, clicks: 100 })], at).outcome).toBe('inconclusive');
  });
});
