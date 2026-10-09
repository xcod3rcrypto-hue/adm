import type { DiagnosticKind, DiagnosticSeverity, Platform, SuggestedAction } from '@advertex/shared';
import { deriveMetrics, groupBy, relativeChange, sumRows, type MetricRow } from './metrics';

/**
 * Motor de diagnóstico determinístico (sem IA): cada achado traz evidências
 * numéricas, período, confiança, impacto, riscos e limitações. Os limiares são
 * conservadores e documentados em docs/ARCHITECTURE.md (seção Inteligência).
 */

export interface CampaignInfo {
  id: string;
  name: string;
  platform: Platform;
  currency: string;
  dailyBudget: number | null;
}

export interface DailyRow extends MetricRow {
  campaignId: string;
}

export interface Evidence {
  label: string;
  value: string;
}

export interface Diagnostic {
  kind: DiagnosticKind;
  severity: DiagnosticSeverity;
  campaignId: string;
  title: string;
  summary: string;
  evidence: Evidence[];
  confidence: number;
  impact: string;
  recommendation: {
    title: string;
    rationale: string;
    risks: string;
    limitations: string;
    action: SuggestedAction | null;
  };
}

export const THRESHOLDS = {
  /** Variação mínima para considerar aumento de CPA ou queda de conversões. */
  relativeChange: 0.3,
  /** Volume mínimo de conversões em cada período para comparar CPA/conversões. */
  minConversions: 10,
  /** Gasto médio diário acima de X vezes o orçamento diário. */
  overspendFactor: 1.2,
  /** Dias finais sem conversão para alertar rastreamento. */
  trackingTailDays: 3,
  /** Janela (dias) usada para comparar CTR inicial x final (fadiga). */
  fatigueWindow: 7,
  /** Queda relativa de CTR para sugerir possível fadiga. */
  fatigueDrop: 0.25,
  /** Impressões mínimas por janela para comparar CTR. */
  fatigueMinImpressions: 5000,
  /** Desvios-padrão para considerar um pico de gasto anômalo. */
  anomalyZ: 3,
  /** ROAS abaixo do qual a campanha devolve menos do que investe. */
  lowRoas: 1,
  /** Conversões mínimas para recomendar escala. */
  scaleMinConversions: 20,
  /** CPA ao menos X% abaixo da média da moeda para recomendar escala. */
  scaleCpaAdvantage: 0.3,
} as const;

const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
const money = (v: number | null, currency: string) =>
  v === null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(v);
const int = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);

/** Confiança cresce com o volume observado e satura em 0,95 (nunca certeza absoluta). */
export function volumeConfidence(volume: number, target: number): number {
  if (volume <= 0) return 0.1;
  return Math.round(Math.min(0.95, 0.35 + 0.6 * Math.min(1, volume / target)) * 100) / 100;
}

function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / (values.length || 1);
}

function std(values: number[]): number {
  const m = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)));
}

function shift(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface DiagnoseInput {
  campaigns: CampaignInfo[];
  current: DailyRow[];
  previous: DailyRow[];
  period: { from: string; to: string };
}

export function diagnose(input: DiagnoseInput): Diagnostic[] {
  const out: Diagnostic[] = [];
  const byCampaign = groupBy(input.current, (r) => r.campaignId);
  const prevByCampaign = groupBy(input.previous, (r) => r.campaignId);
  const campaigns = new Map(input.campaigns.map((c) => [c.id, c]));

  // Média de CPA por moeda (referência para oportunidades de escala).
  const cpaByCurrency = new Map<string, number | null>();
  for (const [currency, rows] of groupBy(input.current, (r) => r.currency)) {
    cpaByCurrency.set(currency, deriveMetrics(sumRows(rows)).cpa);
  }

  for (const [campaignId, rows] of byCampaign) {
    const c = campaigns.get(campaignId);
    if (!c) continue;
    const cur = sumRows(rows);
    const curD = deriveMetrics(cur);
    const prevRows = prevByCampaign.get(campaignId) ?? [];
    const prev = prevRows.length > 0 ? sumRows(prevRows) : null;
    const prevD = prev ? deriveMetrics(prev) : null;
    const days = new Set(rows.map((r) => r.date)).size;
    const base = { campaignId };

    // 1. Aumento de CPA
    if (prev && prevD && cur.conversions >= THRESHOLDS.minConversions && prev.conversions >= THRESHOLDS.minConversions) {
      const change = relativeChange(curD.cpa, prevD.cpa);
      if (change !== null && change > THRESHOLDS.relativeChange) {
        out.push({
          ...base,
          kind: 'cpa_increase',
          severity: change > 0.6 ? 'critical' : 'warning',
          title: `CPA subiu ${pct(change)} em "${c.name}"`,
          summary: `O custo por conversão passou de ${money(prevD.cpa, c.currency)} para ${money(curD.cpa, c.currency)} em relação ao período anterior de mesma duração.`,
          evidence: [
            { label: 'CPA atual', value: money(curD.cpa, c.currency) },
            { label: 'CPA anterior', value: money(prevD.cpa, c.currency) },
            { label: 'Conversões (atual / anterior)', value: `${int(cur.conversions)} / ${int(prev.conversions)}` },
            { label: 'Investimento (atual / anterior)', value: `${money(cur.spend, c.currency)} / ${money(prev.spend, c.currency)}` },
          ],
          confidence: volumeConfidence(Math.min(cur.conversions, prev.conversions), 60),
          impact: `Mantido o volume atual, o custo extra estimado é de ${money((curD.cpa! - prevD.cpa!) * cur.conversions, c.currency)} no período.`,
          recommendation: {
            title: 'Revisar segmentação, lances e criativos da campanha',
            rationale: 'CPA crescente com volume suficiente indica perda de eficiência real, não ruído estatístico.',
            risks: 'Mudanças bruscas podem reiniciar a fase de aprendizado da plataforma.',
            limitations: 'Comparação agregada por campanha; não identifica qual conjunto, anúncio ou público causou a variação.',
            action: { type: 'review_campaign' },
          },
        });
      }
    }

    // 2. Queda de conversões
    if (prev && prev.conversions >= THRESHOLDS.minConversions) {
      const change = relativeChange(cur.conversions, prev.conversions);
      if (change !== null && change < -THRESHOLDS.relativeChange) {
        const spendChange = relativeChange(cur.spend, prev.spend);
        out.push({
          ...base,
          kind: 'conversion_drop',
          severity: change < -0.6 ? 'critical' : 'warning',
          title: `Conversões caíram ${pct(Math.abs(change))} em "${c.name}"`,
          summary: `Foram ${int(cur.conversions)} conversões contra ${int(prev.conversions)} no período anterior${spendChange !== null ? `, com investimento ${spendChange >= 0 ? 'subindo' : 'caindo'} ${pct(Math.abs(spendChange))}` : ''}.`,
          evidence: [
            { label: 'Conversões (atual / anterior)', value: `${int(cur.conversions)} / ${int(prev.conversions)}` },
            { label: 'Investimento (atual / anterior)', value: `${money(cur.spend, c.currency)} / ${money(prev.spend, c.currency)}` },
            { label: 'Cliques (atual / anterior)', value: `${int(cur.clicks)} / ${int(prev.clicks)}` },
          ],
          confidence: volumeConfidence(prev.conversions, 60),
          impact: `${int(prev.conversions - cur.conversions)} conversões a menos no período.`,
          recommendation: {
            title: 'Verificar página de destino, oferta e rastreamento',
            rationale:
              spendChange !== null && spendChange < -THRESHOLDS.relativeChange
                ? 'A queda acompanha a redução de investimento; confirme se foi intencional.'
                : 'A queda não é explicada por menor investimento: investigue mudanças no funil ou na medição.',
            risks: 'Pausar a campanha sem diagnóstico pode interromper vendas que ainda acontecem.',
            limitations: 'Conversões dependem da janela de atribuição e podem ser revisadas pela plataforma nos dias seguintes.',
            action: { type: 'check_tracking' },
          },
        });
      }
    }

    // 3. Gasto acima do orçamento
    if (c.dailyBudget && c.dailyBudget > 0 && days > 0) {
      const avg = cur.spend / days;
      if (avg > c.dailyBudget * THRESHOLDS.overspendFactor) {
        out.push({
          ...base,
          kind: 'overspend',
          severity: 'warning',
          title: `Gasto médio acima do orçamento em "${c.name}"`,
          summary: `Média diária de ${money(avg, c.currency)} para um orçamento diário de ${money(c.dailyBudget, c.currency)}.`,
          evidence: [
            { label: 'Gasto médio diário', value: money(avg, c.currency) },
            { label: 'Orçamento diário registrado', value: money(c.dailyBudget, c.currency) },
            { label: 'Dias com dados', value: String(days) },
          ],
          confidence: volumeConfidence(days, 14),
          impact: `Excedente estimado de ${money((avg - c.dailyBudget) * days, c.currency)} no período.`,
          recommendation: {
            title: 'Conferir orçamento e limites de gasto da conta',
            rationale: 'As plataformas podem gastar acima do diário em dias isolados, mas uma média persistente sugere orçamento desatualizado no cadastro ou limite ausente.',
            risks: 'Reduzir o orçamento pode diminuir o volume de conversões.',
            limitations: 'O orçamento considerado é o último sincronizado/cadastrado; mudanças no meio do período não são refletidas.',
            action: { type: 'adjust_budget', changePercent: -Math.round(((avg - c.dailyBudget) / avg) * 100) },
          },
        });
      }
    }

    // 4. Gasto sem conversões no fim do período (rastreamento)
    const tailStart = shift(input.period.to, -(THRESHOLDS.trackingTailDays - 1));
    const tail = rows.filter((r) => r.date >= tailStart);
    const before = rows.filter((r) => r.date < tailStart);
    const tailSpend = tail.reduce((s, r) => s + r.spend, 0);
    const tailConv = tail.reduce((s, r) => s + r.conversions, 0);
    const beforeConv = before.reduce((s, r) => s + r.conversions, 0);
    if (tail.length > 0 && tailSpend > 0 && tailConv === 0 && beforeConv >= 3) {
      out.push({
        ...base,
        kind: 'tracking_issue',
        severity: 'critical',
        title: `Possível falha de rastreamento em "${c.name}"`,
        summary: `Nenhuma conversão nos últimos ${THRESHOLDS.trackingTailDays} dias, apesar de ${money(tailSpend, c.currency)} investidos; antes disso houve ${int(beforeConv)} conversões.`,
        evidence: [
          { label: `Investimento nos últimos ${THRESHOLDS.trackingTailDays} dias`, value: money(tailSpend, c.currency) },
          { label: `Conversões nos últimos ${THRESHOLDS.trackingTailDays} dias`, value: '0' },
          { label: 'Conversões antes disso no período', value: int(beforeConv) },
        ],
        confidence: volumeConfidence(beforeConv, 30),
        impact: 'Se o pixel/tag parou de registrar, a otimização automática da plataforma fica comprometida.',
        recommendation: {
          title: 'Validar pixel/tag de conversão e eventos do site',
          rationale: 'Queda abrupta para zero com investimento contínuo é típica de falha de medição.',
          risks: 'Baixo: a verificação não altera a veiculação.',
          limitations: 'Conversões podem chegar com atraso por causa da atribuição; reavalie após nova sincronização.',
          action: { type: 'check_tracking' },
        },
      });
    }

    // 5. Possível fadiga criativa (queda de CTR entre o início e o fim do período)
    const dates = [...new Set(rows.map((r) => r.date))].sort();
    if (dates.length >= THRESHOLDS.fatigueWindow * 2) {
      const first = new Set(dates.slice(0, THRESHOLDS.fatigueWindow));
      const last = new Set(dates.slice(-THRESHOLDS.fatigueWindow));
      const a = sumRows(rows.filter((r) => first.has(r.date)));
      const b = sumRows(rows.filter((r) => last.has(r.date)));
      if (a.impressions >= THRESHOLDS.fatigueMinImpressions && b.impressions >= THRESHOLDS.fatigueMinImpressions) {
        const ctrA = a.clicks / a.impressions;
        const ctrB = b.clicks / b.impressions;
        const change = relativeChange(ctrB, ctrA);
        if (change !== null && change < -THRESHOLDS.fatigueDrop) {
          out.push({
            ...base,
            kind: 'creative_fatigue',
            severity: 'warning',
            title: `Possível fadiga criativa em "${c.name}"`,
            summary: `O CTR caiu de ${(ctrA * 100).toFixed(2)}% (primeiros ${THRESHOLDS.fatigueWindow} dias) para ${(ctrB * 100).toFixed(2)}% (últimos ${THRESHOLDS.fatigueWindow} dias).`,
            evidence: [
              { label: 'CTR inicial', value: `${(ctrA * 100).toFixed(2)}%` },
              { label: 'CTR final', value: `${(ctrB * 100).toFixed(2)}%` },
              { label: 'Impressões (inicial / final)', value: `${int(a.impressions)} / ${int(b.impressions)}` },
            ],
            confidence: volumeConfidence(Math.min(a.clicks, b.clicks), 400),
            impact: 'CTR menor tende a elevar CPC e CPA nas próximas semanas.',
            recommendation: {
              title: 'Renovar criativos ou testar novos ângulos',
              rationale: 'Queda sustentada de CTR com volume relevante é um sinal comum de saturação do público com os mesmos anúncios.',
              risks: 'Trocar todos os criativos de uma vez dificulta saber o que funcionou: prefira registrar um experimento.',
              limitations: 'Dados agregados por campanha, sem frequência por anúncio: trate como hipótese, não como diagnóstico confirmado.',
              action: { type: 'refresh_creative' },
            },
          });
        }
      }
    }

    // 6. Pico de gasto anômalo
    const dailySpend = [...groupBy(rows, (r) => r.date)].map(([date, list]) => ({ date, spend: list.reduce((s, r) => s + r.spend, 0) }));
    if (dailySpend.length >= 10) {
      const values = dailySpend.map((d) => d.spend);
      const m = mean(values);
      const sd = std(values);
      const peak = dailySpend.reduce((p, d) => (d.spend > p.spend ? d : p));
      if (sd > 0 && (peak.spend - m) / sd > THRESHOLDS.anomalyZ) {
        out.push({
          ...base,
          kind: 'spend_anomaly',
          severity: 'warning',
          title: `Pico de gasto incomum em "${c.name}" (${peak.date})`,
          summary: `Gasto de ${money(peak.spend, c.currency)} no dia, contra média de ${money(m, c.currency)}.`,
          evidence: [
            { label: 'Gasto no dia', value: money(peak.spend, c.currency) },
            { label: 'Média diária no período', value: money(m, c.currency) },
            { label: 'Desvios-padrão acima da média', value: ((peak.spend - m) / sd).toFixed(1) },
          ],
          confidence: volumeConfidence(dailySpend.length, 30),
          impact: `${money(peak.spend - m, c.currency)} acima do esperado em um único dia.`,
          recommendation: {
            title: 'Verificar alterações de orçamento ou lance nesse dia',
            rationale: 'Picos isolados costumam vir de mudanças manuais, regras automáticas ou eventos sazonais.',
            risks: 'Baixo: apenas investigação.',
            limitations: 'Detecção estatística simples (z-score), sensível a sazonalidade semanal.',
            action: { type: 'review_campaign' },
          },
        });
      }
    }

    // 7. ROAS abaixo de 1
    if (curD.roas !== null && curD.roas < THRESHOLDS.lowRoas && cur.spend > 0 && cur.conversions >= 5) {
      out.push({
        ...base,
        kind: 'low_roas',
        severity: curD.roas < 0.5 ? 'critical' : 'warning',
        title: `ROAS abaixo de 1 em "${c.name}"`,
        summary: `A receita atribuída (${money(cur.revenue, c.currency)}) é menor que o investimento (${money(cur.spend, c.currency)}).`,
        evidence: [
          { label: 'ROAS', value: curD.roas.toFixed(2) },
          { label: 'Receita atribuída', value: money(cur.revenue, c.currency) },
          { label: 'Investimento', value: money(cur.spend, c.currency) },
        ],
        confidence: volumeConfidence(cur.conversions, 50),
        impact: `Resultado líquido atribuído de ${money((cur.revenue ?? 0) - cur.spend, c.currency)} no período.`,
        recommendation: {
          title: 'Reduzir investimento ou rever oferta e público',
          rationale: 'Retorno atribuído inferior ao custo indica que a campanha, como está, não se paga dentro da janela de atribuição.',
          risks: 'Campanhas de topo de funil podem ter retorno indireto não capturado pela atribuição.',
          limitations: 'ROAS depende do valor de conversão enviado pelo site; não inclui margem nem recompra.',
          action: { type: 'adjust_budget', changePercent: -20 },
        },
      });
    }

    // 8. Oportunidade de escala
    const avgCpa = cpaByCurrency.get(c.currency) ?? null;
    if (avgCpa !== null && curD.cpa !== null && cur.conversions >= THRESHOLDS.scaleMinConversions && byCampaign.size > 1) {
      const advantage = 1 - curD.cpa / avgCpa;
      if (advantage >= THRESHOLDS.scaleCpaAdvantage) {
        out.push({
          ...base,
          kind: 'scale_opportunity',
          severity: 'opportunity',
          title: `Oportunidade de escala em "${c.name}"`,
          summary: `CPA de ${money(curD.cpa, c.currency)}, ${pct(advantage)} abaixo da média das campanhas em ${c.currency} (${money(avgCpa, c.currency)}).`,
          evidence: [
            { label: 'CPA da campanha', value: money(curD.cpa, c.currency) },
            { label: `CPA médio (${c.currency})`, value: money(avgCpa, c.currency) },
            { label: 'Conversões', value: int(cur.conversions) },
          ],
          confidence: volumeConfidence(cur.conversions, 80),
          impact: 'Realocar verba para campanhas mais eficientes tende a reduzir o CPA médio da conta.',
          recommendation: {
            title: 'Aumentar o orçamento gradualmente (15–20%)',
            rationale: 'Aumentos graduais preservam o aprendizado da plataforma enquanto testam se a eficiência se mantém com mais verba.',
            risks: 'O CPA marginal costuma subir com mais orçamento; acompanhe por alguns dias.',
            limitations: 'A eficiência observada pode não se manter em volumes maiores (retornos decrescentes).',
            action: { type: 'adjust_budget', changePercent: 15 },
          },
        });
      }
    }
  }

  const order: Record<DiagnosticSeverity, number> = { critical: 0, warning: 1, opportunity: 2, info: 3 };
  return out.sort((a, b) => order[a.severity] - order[b.severity] || b.confidence - a.confidence);
}
