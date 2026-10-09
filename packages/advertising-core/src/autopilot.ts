import type { AutopilotActionKind, AutopilotSettings, Platform } from '@advertex/shared';
import { twoProportionZ, twoSidedP } from './experiments';

/**
 * Piloto automático: regras puras que transformam dados de desempenho em
 * propostas de ação. Nada aqui chama APIs — a aplicação é feita depois, com
 * aprovação (ou auto-aplicação explícita), idempotência e auditoria.
 */

export interface TermInput {
  term: string;
  status: string;
  campaignId: string | null;
  campaignName: string | null;
  remoteCampaignId: string;
  remoteAdGroupId: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface AdInput {
  id: string;
  platform: Platform;
  remoteAdId: string;
  remoteAdGroupId: string | null;
  campaignId: string | null;
  campaignName: string | null;
  name: string;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface CampaignInput {
  campaignId: string;
  name: string;
  platform: Platform;
  status: string;
  dailyBudget: number | null;
  spend: number;
  conversions: number;
  days: number;
}

export interface ActionDraft {
  kind: AutopilotActionKind;
  platform: Platform;
  campaignId: string | null;
  title: string;
  rationale: string;
  evidence: string[];
  impact: string;
  confidence: number;
  target: Record<string, string | number | null>;
  dedupeKey: string;
  /** Gasto mensal evitado estimado (negativar/pausar). */
  monthlySavings: number;
}

const money = (v: number, currency: string) => v.toLocaleString('pt-BR', { style: 'currency', currency, maximumFractionDigits: 2 });
const pct = (v: number) => `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
const ACTIVE = /^(ENABLED|ACTIVE|active)$/;

export function normalizeTerm(t: string): string {
  return t.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function proposeActions(input: {
  terms: TermInput[];
  ads: AdInput[];
  campaigns: CampaignInput[];
  settings: AutopilotSettings;
  periodDays: number;
  currency: string;
  /** Termos que a IA classificou como sem relação com o negócio. */
  irrelevantTerms?: Set<string>;
}): { actions: ActionDraft[]; notes: string[] } {
  const { settings, currency } = input;
  const notes: string[] = [];
  const actions: ActionDraft[] = [];
  const scale = 30 / Math.max(1, input.periodDays);

  // CPA de referência: o alvo informado ou o CPA observado da conta.
  const tSpend = input.terms.reduce((s, t) => s + t.spend, 0) + input.ads.filter((a) => a.platform === 'meta').reduce((s, a) => s + a.spend, 0);
  const tConv = input.terms.reduce((s, t) => s + t.conversions, 0) + input.ads.filter((a) => a.platform === 'meta').reduce((s, a) => s + a.conversions, 0);
  const observedCpa = tConv > 0 ? tSpend / tConv : null;
  const targetCpa = settings.targetCpa ?? observedCpa;
  if (!settings.targetCpa) {
    notes.push(
      observedCpa
        ? `Sem CPA alvo definido: usando o CPA observado (${money(observedCpa, currency)}) como referência. Defina o seu alvo para decisões mais precisas.`
        : 'Sem CPA alvo e sem conversões registradas: regras baseadas em conversão ficam limitadas. Configure o acompanhamento de conversões.',
    );
  }

  // ---- Termos de busca → negativas e novas palavras-chave ----
  const termClicks = input.terms.reduce((s, t) => s + t.clicks, 0);
  const cvr = termClicks > 0 ? input.terms.reduce((s, t) => s + Math.min(t.conversions, t.clicks), 0) / termClicks : 0;
  const seenTerms = new Set<string>();
  for (const t of [...input.terms].sort((a, b) => b.spend - a.spend)) {
    const norm = normalizeTerm(t.term);
    if (!norm || t.status === 'ADDED' || t.status === 'EXCLUDED' || t.status === 'ADDED_EXCLUDED') continue;
    const key = `${t.remoteCampaignId}:${norm}`;
    if (seenTerms.has(key)) continue;
    const aiIrrelevant = input.irrelevantTerms?.has(norm) ?? false;

    if (t.conversions === 0) {
      const byClicks = t.clicks >= settings.minClicksNegative;
      const bySpend = targetCpa !== null && t.spend >= targetCpa;
      const byAi = aiIrrelevant && t.clicks >= 2;
      if ((byClicks || bySpend || byAi) && (cvr > 0 || byAi)) {
        seenTerms.add(key);
        // Probabilidade de ver 0 conversões em n cliques se o termo convertesse como a média.
        const confidence = byAi ? 0.9 : Math.min(0.99, 1 - Math.pow(1 - cvr, t.clicks));
        const why = [
          `${t.clicks} clique(s) e ${money(t.spend, currency)} gastos sem nenhuma conversão`,
          cvr > 0 ? `a taxa de conversão média dos termos é ${pct(cvr)}` : null,
          byAi ? 'a IA avaliou que a busca não corresponde ao que você vende' : null,
        ].filter(Boolean) as string[];
        actions.push({
          kind: 'add_negative',
          platform: 'google',
          campaignId: t.campaignId,
          title: `Negativar "${t.term}"`,
          rationale: `${why.join('; ')}.`,
          evidence: [`Campanha: ${t.campaignName ?? t.remoteCampaignId}`, `Impressões: ${t.impressions}`, `Cliques: ${t.clicks}`, `Custo: ${money(t.spend, currency)}`],
          impact: `Economia estimada de ${money(t.spend * scale, currency)}/mês`,
          confidence,
          target: { term: t.term, matchType: 'EXACT', remoteCampaignId: t.remoteCampaignId },
          dedupeKey: `add_negative:${t.remoteCampaignId}:${norm}`,
          monthlySavings: t.spend * scale,
        });
      }
      continue;
    }

    const cpa = t.spend / t.conversions;
    // Sem alvo definido, aceita até 20% acima do CPA médio observado.
    const goodCpa = targetCpa === null ? true : cpa <= (settings.targetCpa ?? targetCpa * 1.2);
    if (t.conversions >= settings.minConversionsKeyword && goodCpa) {
      seenTerms.add(key);
      actions.push({
        kind: 'add_keyword',
        platform: 'google',
        campaignId: t.campaignId,
        title: `Adicionar "${t.term}" como palavra-chave exata`,
        rationale: `A busca gerou ${t.conversions.toLocaleString('pt-BR')} conversão(ões) a ${money(cpa, currency)} cada${targetCpa ? ` (alvo ${money(targetCpa, currency)})` : ''}. Como palavra-chave exata, você controla o lance e garante a entrega.`,
        evidence: [`Campanha: ${t.campaignName ?? t.remoteCampaignId}`, `Cliques: ${t.clicks}`, `Conversões: ${t.conversions}`, `Custo: ${money(t.spend, currency)}`],
        impact: `Proteger ~${Math.round(t.conversions * scale)} conversão(ões)/mês`,
        confidence: Math.min(0.95, 0.6 + t.conversions * 0.08),
        target: { term: t.term, matchType: 'EXACT', remoteCampaignId: t.remoteCampaignId, remoteAdGroupId: t.remoteAdGroupId },
        dedupeKey: `add_keyword:${t.remoteAdGroupId}:${norm}`,
        monthlySavings: 0,
      });
    }
  }
  if (input.terms.length > 0 && cvr === 0 && !input.irrelevantTerms?.size) notes.push('Nenhum termo de busca converteu no período: negativas por desempenho foram suspensas para não bloquear buscas boas.');

  // ---- Anúncios → pausar os que perdem com folga para os irmãos ----
  const groups = new Map<string, AdInput[]>();
  for (const a of input.ads) {
    if (!a.remoteAdGroupId || !ACTIVE.test(a.status)) continue;
    const k = `${a.platform}:${a.remoteAdGroupId}`;
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(a);
  }
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const candidates: Array<ActionDraft & { score: number }> = [];
    for (const a of list) {
      const rest = list.filter((x) => x !== a);
      const ri = rest.reduce((s, x) => s + x.impressions, 0);
      const rc = rest.reduce((s, x) => s + x.clicks, 0);
      const rv = rest.reduce((s, x) => s + x.conversions, 0);
      const rs = rest.reduce((s, x) => s + x.spend, 0);
      let reason: string | null = null;
      let confidence = 0;
      if (a.impressions >= 2000 && ri >= 2000 && rc > 0) {
        const z = twoProportionZ(rc, ri, a.clicks, a.impressions);
        const lift = a.clicks / a.impressions / (rc / ri) - 1;
        const conf = z === null ? 0 : 1 - twoSidedP(z);
        if (lift <= -0.35 && conf >= 0.95) {
          reason = `CTR ${pct(a.clicks / a.impressions)} contra ${pct(rc / ri)} dos outros anúncios do mesmo grupo (${Math.round(-lift * 100)}% menor)`;
          confidence = conf;
        }
      }
      if (!reason && targetCpa !== null && a.conversions === 0 && a.spend >= 2 * targetCpa && rv > 0) {
        reason = `${money(a.spend, currency)} gastos sem conversão, enquanto os outros anúncios do grupo converteram ${rv.toLocaleString('pt-BR')} vez(es) a ${money(rs / rv, currency)}`;
        confidence = 0.85;
      }
      if (!reason) continue;
      candidates.push({
        kind: 'pause_ad',
        platform: a.platform,
        campaignId: a.campaignId,
        title: `Pausar o anúncio "${a.name || a.remoteAdId}"`,
        rationale: `${reason}. A verba passa para os anúncios que performam melhor.`,
        evidence: [`Campanha: ${a.campaignName ?? '-'}`, `Impressões: ${a.impressions}`, `Cliques: ${a.clicks}`, `Conversões: ${a.conversions}`, `Custo: ${money(a.spend, currency)}`],
        impact: `Realocar ~${money(a.spend * scale, currency)}/mês para anúncios melhores`,
        confidence,
        target: { remoteAdId: a.remoteAdId, remoteAdGroupId: a.remoteAdGroupId, adName: a.name, adPerformanceId: a.id },
        dedupeKey: `pause_ad:${a.platform}:${a.remoteAdId}`,
        monthlySavings: a.spend * scale,
        score: confidence * a.spend,
      });
    }
    // Nunca deixa o grupo sem anúncio ativo.
    candidates
      .sort((x, y) => y.score - x.score)
      .slice(0, list.length - 1)
      .forEach(({ score: _score, ...d }) => actions.push(d));
  }

  // ---- Orçamento: escalar quem bate a meta, frear quem estoura ----
  if (settings.targetCpa) {
    const target = settings.targetCpa;
    for (const c of input.campaigns) {
      if (!ACTIVE.test(c.status) || !c.dailyBudget || c.dailyBudget <= 0) continue;
      const cpa = c.conversions > 0 ? c.spend / c.conversions : null;
      const step = settings.budgetStepPct / 100;
      if (cpa !== null && c.conversions >= 5 && cpa <= 0.8 * target) {
        const to = Math.round(c.dailyBudget * (1 + step) * 100) / 100;
        actions.push({
          kind: 'increase_budget',
          platform: c.platform,
          campaignId: c.campaignId,
          title: `Aumentar o orçamento de "${c.name}" em ${settings.budgetStepPct}%`,
          rationale: `CPA de ${money(cpa, currency)} nos últimos ${c.days} dias, ${Math.round((1 - cpa / target) * 100)}% abaixo do alvo (${money(target, currency)}), com ${c.conversions.toLocaleString('pt-BR')} conversões. Há espaço para escalar.`,
          evidence: [`Gasto: ${money(c.spend, currency)}`, `Conversões: ${c.conversions}`, `Orçamento atual: ${money(c.dailyBudget, currency)}/dia`],
          impact: `+${money(to - c.dailyBudget, currency)}/dia; ~${Math.round(((to - c.dailyBudget) * 30) / cpa)} conversões/mês a mais se o CPA se mantiver`,
          confidence: Math.min(0.9, 0.55 + c.conversions * 0.03),
          target: { from: c.dailyBudget, to },
          dedupeKey: `budget:${c.campaignId}`,
          monthlySavings: 0,
        });
      } else if (c.spend >= 3 * target && (cpa === null || cpa >= 1.5 * target)) {
        const to = Math.round(c.dailyBudget * (1 - step) * 100) / 100;
        actions.push({
          kind: 'decrease_budget',
          platform: c.platform,
          campaignId: c.campaignId,
          title: `Reduzir o orçamento de "${c.name}" em ${settings.budgetStepPct}%`,
          rationale:
            cpa === null
              ? `${money(c.spend, currency)} gastos em ${c.days} dias sem conversões (alvo ${money(target, currency)}).`
              : `CPA de ${money(cpa, currency)}, ${Math.round((cpa / target - 1) * 100)}% acima do alvo (${money(target, currency)}).`,
          evidence: [`Gasto: ${money(c.spend, currency)}`, `Conversões: ${c.conversions}`, `Orçamento atual: ${money(c.dailyBudget, currency)}/dia`],
          impact: `Economia de ${money((c.dailyBudget - to) * 30, currency)}/mês enquanto os criativos e termos são ajustados`,
          confidence: cpa === null ? 0.8 : 0.75,
          target: { from: c.dailyBudget, to },
          dedupeKey: `budget:${c.campaignId}`,
          monthlySavings: (c.dailyBudget - to) * 30,
        });
      }
    }
  } else if (input.campaigns.length > 0) {
    notes.push('Ajustes de orçamento só são sugeridos com um CPA alvo definido nas configurações do piloto.');
  }

  return { actions, notes };
}
