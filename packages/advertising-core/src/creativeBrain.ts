import type { CreativePattern, Platform } from '@advertex/shared';
import { twoProportionZ, twoSidedP } from './experiments';

/**
 * Cérebro criativo: características determinísticas do texto de um anúncio e
 * mineração de padrões (característica → desempenho) com teste estatístico.
 * Tudo aqui é puro e testável; a IA só acrescenta características semânticas.
 */

export const FEATURE_LABELS: Record<string, { label: string; values: Record<string, string> }> = {
  numero: { label: 'Número no texto', values: { sim: 'com número', nao: 'sem número' } },
  pergunta: { label: 'Pergunta', values: { sim: 'com pergunta', nao: 'sem pergunta' } },
  emoji: { label: 'Emoji', values: { sim: 'com emoji', nao: 'sem emoji' } },
  preco_oferta: { label: 'Preço/oferta explícita', values: { sim: 'com preço ou oferta', nao: 'sem preço ou oferta' } },
  urgencia_textual: { label: 'Palavras de urgência', values: { sim: 'com urgência', nao: 'sem urgência' } },
  voce: { label: 'Fala com "você"', values: { sim: 'falando com "você"', nao: 'sem "você"' } },
  tamanho_titulo: { label: 'Tamanho do título', values: { curto: 'título curto (até 25)', medio: 'título médio (26–40)', longo: 'título longo (40+)' } },
  tamanho_texto: { label: 'Tamanho do texto', values: { curto: 'texto curto (até 90)', medio: 'texto médio (91–200)', longo: 'texto longo (200+)' } },
  cta: { label: 'Botão (CTA)', values: {} },
  angulo: {
    label: 'Ângulo',
    values: {
      beneficio: 'ângulo de benefício',
      dor: 'ângulo de dor/problema',
      curiosidade: 'ângulo de curiosidade',
      prova_social: 'prova social',
      oferta: 'ângulo de oferta',
      autoridade: 'autoridade',
      urgencia: 'urgência',
      comparacao: 'comparação',
      novidade: 'novidade',
      identificacao: 'identificação com o público',
    },
  },
  emocao: {
    label: 'Emoção',
    values: { confianca: 'emoção de confiança', alivio: 'emoção de alívio', desejo: 'emoção de desejo', medo: 'emoção de medo', alegria: 'emoção de alegria', curiosidade: 'emoção de curiosidade', orgulho: 'emoção de orgulho', neutra: 'tom emocional neutro' },
  },
  tom: { label: 'Tom', values: { direto: 'tom direto', emocional: 'tom emocional', tecnico: 'tom técnico', divertido: 'tom divertido', inspirador: 'tom inspirador', informativo: 'tom informativo' } },
  gancho: {
    label: 'Gancho de abertura',
    values: {
      pergunta: 'abertura com pergunta',
      afirmacao_ousada: 'abertura com afirmação ousada',
      numero_dado: 'abertura com número/dado',
      historia: 'abertura com história',
      comando: 'abertura com comando',
      problema: 'abertura com problema',
      beneficio_direto: 'abertura com benefício direto',
    },
  },
};

export function featureLabel(feature: string): string {
  return FEATURE_LABELS[feature]?.label ?? feature;
}

export function valueLabel(feature: string, value: string): string {
  return FEATURE_LABELS[feature]?.values[value] ?? `${featureLabel(feature).toLowerCase()} ${value.toLowerCase().replace(/_/g, ' ')}`;
}

const EMOJI = /\p{Extended_Pictographic}/u;
const PRICE = /R\$|\$|€|\d+\s?%|desconto|grátis|gratis|frete|promo|oferta|cupom|parcel|à vista|a vista|off\b/i;
const URGENCY = /\bhoje\b|\bagora\b|últim[ao]s?|ultim[ao]s?|só até|so ate|\bcorra\b|não perca|nao perca|tempo limitado|acaba|imperdível|imperdivel/i;
const YOU = /(?<![\p{L}])(você|voce|seu|sua|seus|suas)(?![\p{L}])/iu;

/** Características objetivas do texto (sem IA). */
export function ruleFeatures(ad: { headline: string; body: string; cta?: string }): Record<string, string> {
  const all = `${ad.headline} ${ad.body}`;
  const yesNo = (b: boolean) => (b ? 'sim' : 'nao');
  const h = ad.headline.trim().length;
  const b = ad.body.trim().length;
  const out: Record<string, string> = {
    numero: yesNo(/\d/.test(all)),
    pergunta: yesNo(all.includes('?')),
    emoji: yesNo(EMOJI.test(all)),
    preco_oferta: yesNo(PRICE.test(all)),
    urgencia_textual: yesNo(URGENCY.test(all)),
    voce: yesNo(YOU.test(all)),
  };
  if (h > 0) out.tamanho_titulo = h <= 25 ? 'curto' : h <= 40 ? 'medio' : 'longo';
  if (b > 0) out.tamanho_texto = b <= 90 ? 'curto' : b <= 200 ? 'medio' : 'longo';
  if (ad.cta && ad.cta.trim()) out.cta = ad.cta.trim().toUpperCase();
  return out;
}

export interface BrainAd {
  id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  features: Record<string, string>;
}

export const BRAIN_THRESHOLDS = {
  /** Impressões mínimas para o anúncio entrar na análise. */
  minAdImpressions: 200,
  /** Mínimo de anúncios em cada lado da comparação. */
  minAdsPerSide: 2,
  minImpressionsPerSide: 1000,
  minClicksPerSideCvr: 30,
  minConfidence: 0.9,
  minAbsLift: 0.15,
};

const pct = (v: number) => `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: v < 0.01 ? 2 : 1 })}%`;

function describe(p: Omit<CreativePattern, 'sentence'>): string {
  const metric = p.metric === 'ctr' ? 'CTR' : 'taxa de conversão';
  const ratio = p.rate / p.baselineRate;
  const how =
    p.lift >= 0
      ? ratio >= 1.95
        ? `${ratio.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}× maior`
        : `${Math.round(p.lift * 100)}% maior`
      : `${Math.round(-p.lift * 100)}% menor`;
  const where = p.platform === 'meta' ? '[Meta Ads] ' : p.platform === 'google' ? '[Google Ads] ' : '';
  return `${where}Anúncios ${p.valueLabel} têm ${metric} ${how} (${pct(p.rate)} vs ${pct(p.baselineRate)}; ${p.ads} anúncio(s); confiança ${Math.round(p.confidence * 100)}%).`;
}


// ---- Estatística no nível do anúncio (cada anúncio é uma observação) ----

function logGamma(x: number): number {
  const c = [76.180091729471, -86.505320329417, 24.014098240831, -1.2317395724502, 0.0012086509738662, -0.000005395239385];
  let y = x;
  const tmp = x + 5.5 - (x + 0.5) * Math.log(x + 5.5);
  let ser = 1.00000000019;
  for (const v of c) ser += v / ++y;
  return -tmp + Math.log((2.506628274631 * ser) / x);
}

/** Beta incompleta regularizada (frações contínuas de Lentz). */
function betaInc(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x > (a + 1) / (a + b + 2)) return 1 - betaInc(b, a, 1 - x);
  let f = 1;
  let c = 1;
  let d = 0;
  for (let i = 0; i <= 200; i += 1) {
    const m = Math.floor(i / 2);
    let num: number;
    if (i === 0) num = 1;
    else if (i % 2 === 0) num = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    else num = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + num * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    c = 1 + num / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    const cd = c * d;
    f *= cd;
    if (Math.abs(1 - cd) < 1e-10) return (front * (f - 1)) / a;
  }
  return (front * (f - 1)) / a;
}

/** p-valor bicaudal da distribuição t de Student. */
export function studentTwoSidedP(t: number, df: number): number {
  if (!Number.isFinite(t) || df <= 0) return 1;
  return betaInc(df / 2, 0.5, df / (df + t * t));
}

/** Teste t de Welch entre as taxas por anúncio dos dois grupos; devolve 1 − p. */
export function welchConfidence(a: number[], b: number[]): number {
  if (a.length < 2 || b.length < 2) return 0;
  const mean = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;
  const variance = (v: number[], m: number) => v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1);
  const ma = mean(a);
  const mb = mean(b);
  const va = variance(a, ma) / a.length;
  const vb = variance(b, mb) / b.length;
  const se = Math.sqrt(va + vb);
  if (se === 0) return ma === mb ? 0 : 0.999;
  const df = (va + vb) ** 2 / ((va * va) / (a.length - 1) + (vb * vb) / (b.length - 1));
  return 1 - studentTwoSidedP((ma - mb) / se, df);
}

/**
 * Para cada característica=valor, compara o grupo com os demais anúncios:
 * CTR (cliques/impressões) e taxa de conversão (conversões/cliques), teste z
 * de duas proporções (volume) combinado com teste t de Welch entre anúncios
 * (consistência): vale a confiança MENOR das duas. Só devolve padrões com
 * volume, confiança e efeito mínimos.
 */
export function minePatterns(ads: BrainAd[], t = BRAIN_THRESHOLDS, platform: Platform | null = null): CreativePattern[] {
  const pool = ads.filter((a) => a.impressions >= t.minAdImpressions);
  const keys = new Map<string, Set<string>>();
  for (const a of pool) for (const [f, v] of Object.entries(a.features)) (keys.get(f) ?? keys.set(f, new Set()).get(f)!).add(v);

  const out: Array<CreativePattern & { signature: string }> = [];
  for (const [feature, values] of keys) {
    const withFeature = pool.filter((a) => a.features[feature] !== undefined);
    if (values.size < 2) continue;
    for (const value of values) {
      const g = withFeature.filter((a) => a.features[feature] === value);
      const r = withFeature.filter((a) => a.features[feature] !== value);
      if (g.length < t.minAdsPerSide || r.length < t.minAdsPerSide) continue;
      const sum = (list: BrainAd[]) => list.reduce((s, a) => ({ i: s.i + a.impressions, c: s.c + a.clicks, v: s.v + a.conversions, sp: s.sp + a.spend }), { i: 0, c: 0, v: 0, sp: 0 });
      const G = sum(g);
      const R = sum(r);
      const signature = g.map((a) => a.id).sort().join(',');
      const base = { platform, feature, featureLabel: featureLabel(feature), value, valueLabel: valueLabel(feature, value), ads: g.length, impressions: G.i, clicks: G.c, conversions: G.v, spend: G.sp };

      if (G.i >= t.minImpressionsPerSide && R.i >= t.minImpressionsPerSide && R.c > 0) {
        const z = twoProportionZ(R.c, R.i, G.c, G.i);
        const rate = G.c / G.i;
        const baselineRate = R.c / R.i;
        if (z !== null && baselineRate > 0) {
          const lift = rate / baselineRate - 1;
          const ctrOf = (list: BrainAd[]) => list.map((a) => a.clicks / a.impressions);
          const confidence = Math.min(1 - twoSidedP(z), welchConfidence(ctrOf(g), ctrOf(r)));
          if (confidence >= t.minConfidence && Math.abs(lift) >= t.minAbsLift) {
            const p = { ...base, metric: 'ctr' as const, direction: lift >= 0 ? ('positive' as const) : ('negative' as const), rate, baselineRate, lift, confidence };
            out.push({ ...p, sentence: describe(p), signature });
          }
        }
      }
      if (G.c >= t.minClicksPerSideCvr && R.c >= t.minClicksPerSideCvr && R.v > 0) {
        const gConv = Math.min(G.v, G.c);
        const rConv = Math.min(R.v, R.c);
        const z = twoProportionZ(rConv, R.c, gConv, G.c);
        const rate = gConv / G.c;
        const baselineRate = rConv / R.c;
        if (z !== null && baselineRate > 0) {
          const lift = rate / baselineRate - 1;
          const cvrOf = (list: BrainAd[]) => list.filter((a) => a.clicks >= 10).map((a) => Math.min(a.conversions, a.clicks) / a.clicks);
          const confidence = Math.min(1 - twoSidedP(z), welchConfidence(cvrOf(g), cvrOf(r)));
          if (confidence >= t.minConfidence && Math.abs(lift) >= t.minAbsLift) {
            const p = { ...base, metric: 'cvr' as const, direction: lift >= 0 ? ('positive' as const) : ('negative' as const), rate, baselineRate, lift, confidence };
            out.push({ ...p, sentence: describe(p), signature });
          }
        }
      }
    }
  }
  // Para características binárias (sim/não), o lado "não" espelha o "sim": mantém só o mais informativo.
  const seen = new Set<string>();
  return out
    .sort((a, b) => b.confidence * Math.abs(b.lift) - a.confidence * Math.abs(a.lift))
    .filter((p) => {
      const binary = p.value === 'sim' || p.value === 'nao';
      const key = binary ? `${p.platform}:${p.feature}:${p.metric}` : `${p.platform}:${p.feature}:${p.value}:${p.metric}`;
      // Mesmo conjunto de anúncios descrito por outra característica (ex.: "pergunta" e "abre com pergunta"): mantém o primeiro.
      const same = `${p.metric}:${p.signature}`;
      if (seen.has(key) || seen.has(same)) return false;
      seen.add(key);
      seen.add(same);
      return true;
    })
    .slice(0, 40)
    .map(({ signature: _s, ...p }) => p);
}

/**
 * Texto curto com os aprendizados mais fortes, para orientar a geração de
 * novos criativos (entra no prompt como dado, entre tags <aprendizados>).
 */
export function learningsBrief(patterns: CreativePattern[], max = 8): string {
  const strong = patterns.filter((p) => p.confidence >= 0.95 || p.ads >= 4).slice(0, max);
  if (strong.length === 0) return '';
  const pos = strong.filter((p) => p.direction === 'positive').map((p) => `+ ${p.sentence}`);
  const neg = strong.filter((p) => p.direction === 'negative').map((p) => `- ${p.sentence}`);
  return [...pos, ...neg].join('\n');
}
