import type { ExperimentMetric, ExperimentResult } from '@advertex/shared';

/**
 * Avaliação estatística de experimentos A/B(/n) com dados agregados.
 * - CTR e taxa de conversão: teste z de duas proporções.
 * - CPA: comparação de taxas de Poisson (conversões por unidade de gasto).
 * Cada variante é comparada ao controle (primeira variante) com correção de
 * Bonferroni. Sem volume mínimo, o resultado é explicitamente inconclusivo.
 */

export interface VariantData {
  id: string;
  label: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export const ALPHA = 0.05;

/** Volume mínimo por variante para cada métrica (documentado em docs/ARCHITECTURE.md). */
export const MIN_SAMPLE: Record<ExperimentMetric, { label: string; check: (v: VariantData) => boolean }> = {
  ctr: { label: '1.000 impressões e 30 cliques por variante', check: (v) => v.impressions >= 1000 && v.clicks >= 30 },
  conversion_rate: { label: '100 cliques e 10 conversões por variante', check: (v) => v.clicks >= 100 && v.conversions >= 10 },
  cpa: { label: '10 conversões e gasto maior que zero por variante', check: (v) => v.conversions >= 10 && v.spend > 0 },
};

/** Valor da métrica; para CPA, menor é melhor. */
export function metricValue(metric: ExperimentMetric, v: VariantData): number | null {
  switch (metric) {
    case 'ctr':
      return v.impressions > 0 ? v.clicks / v.impressions : null;
    case 'conversion_rate':
      return v.clicks > 0 ? v.conversions / v.clicks : null;
    case 'cpa':
      return v.conversions > 0 ? v.spend / v.conversions : null;
  }
}

export const lowerIsBetter = (metric: ExperimentMetric) => metric === 'cpa';

/** Aproximação de erf (Abramowitz–Stegun 7.1.26, erro < 1,5e-7). */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
  return sign * y;
}

export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/** p-valor bicaudal de um escore z. */
export const twoSidedP = (z: number) => 2 * (1 - normalCdf(Math.abs(z)));

/** Teste z de duas proporções (x sucessos em n tentativas). */
export function twoProportionZ(x1: number, n1: number, x2: number, n2: number): number | null {
  if (n1 <= 0 || n2 <= 0) return null;
  const p = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  if (se === 0) return null;
  return (x2 / n2 - x1 / n1) / se;
}

/** Comparação de taxas de Poisson (eventos c por exposição s). */
export function poissonRateZ(c1: number, s1: number, c2: number, s2: number): number | null {
  if (s1 <= 0 || s2 <= 0) return null;
  const lambda = (c1 + c2) / (s1 + s2);
  const se = Math.sqrt(lambda * (1 / s1 + 1 / s2));
  if (se === 0) return null;
  return (c2 / s2 - c1 / s1) / se;
}

function zFor(metric: ExperimentMetric, control: VariantData, v: VariantData): number | null {
  switch (metric) {
    case 'ctr':
      return twoProportionZ(control.clicks, control.impressions, v.clicks, v.impressions);
    case 'conversion_rate':
      return twoProportionZ(control.conversions, control.clicks, v.conversions, v.clicks);
    case 'cpa':
      // Conversões por real investido: taxa maior = CPA menor.
      return poissonRateZ(control.conversions, control.spend, v.conversions, v.spend);
  }
}

export function evaluateExperiment(metric: ExperimentMetric, variants: VariantData[], evaluatedAt: string): ExperimentResult {
  const base = {
    metric,
    alpha: ALPHA,
    evaluatedAt,
    minSample: MIN_SAMPLE[metric].label,
  };
  const values = variants.map((v) => ({ id: v.id, label: v.label, value: metricValue(metric, v), sampleOk: MIN_SAMPLE[metric].check(v) }));

  if (variants.length < 2) {
    return { ...base, outcome: 'inconclusive', winnerId: null, comparisons: [], variants: values, reason: 'É preciso ao menos duas variantes (controle e uma alternativa).' };
  }
  const insufficient = values.filter((v) => !v.sampleOk);
  if (insufficient.length > 0) {
    return {
      ...base,
      outcome: 'inconclusive',
      winnerId: null,
      comparisons: [],
      variants: values,
      reason: `Volume insuficiente em ${insufficient.map((v) => `"${v.label}"`).join(', ')}. Mínimo: ${MIN_SAMPLE[metric].label}.`,
    };
  }

  const control = variants[0]!;
  const corrected = ALPHA / (variants.length - 1);
  const comparisons = variants.slice(1).map((v) => {
    const z = zFor(metric, control, v);
    const p = z === null ? null : twoSidedP(z);
    const cv = metricValue(metric, control);
    const vv = metricValue(metric, v);
    const lift = cv && vv !== null ? (vv - cv) / cv : null;
    // Para CPA, z > 0 significa mais conversões por real (melhor).
    const better = z === null ? null : z > 0;
    return { variantId: v.id, label: v.label, lift, pValue: p, significant: p !== null && p < corrected, better };
  });

  const winners = comparisons.filter((c) => c.significant && c.better);
  if (winners.length > 0) {
    const best = winners.reduce((a, b) => {
      const va = metricValue(metric, variants.find((v) => v.id === a.variantId)!)!;
      const vb = metricValue(metric, variants.find((v) => v.id === b.variantId)!)!;
      return (lowerIsBetter(metric) ? vb < va : vb > va) ? b : a;
    });
    return {
      ...base,
      outcome: 'winner',
      winnerId: best.variantId,
      comparisons,
      variants: values,
      reason: `"${best.label}" supera o controle com significância estatística (p < ${corrected.toFixed(3).replace('.', ',')}${variants.length > 2 ? ', com correção de Bonferroni' : ''}).`,
    };
  }
  if (comparisons.every((c) => c.significant && c.better === false)) {
    return {
      ...base,
      outcome: 'winner',
      winnerId: control.id,
      comparisons,
      variants: values,
      reason: `O controle "${control.label}" é significativamente melhor que todas as alternativas.`,
    };
  }
  return {
    ...base,
    outcome: 'inconclusive',
    winnerId: null,
    comparisons,
    variants: values,
    reason: 'Nenhuma diferença estatisticamente significativa ao nível de 95%. Diferenças observadas podem ser ruído; considere ampliar o período ou o volume.',
  };
}
