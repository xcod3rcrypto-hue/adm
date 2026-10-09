import {
  AppError,
  DiagnosticKind,
  type DiagnosticSeverity,
  type EvidenceItem,
  type Insight,
  type IntelligenceReport,
  type MetricSource,
  type Platform,
  type Recommendation,
  type RecommendationStatus,
  type SuggestedAction,
} from '@advertex/shared';
import { diagnose, type CampaignInfo, type DailyRow } from '@advertex/advertising-core';
import type { AppContext } from '../context';
import { bool, parseJson, requireOrg } from '../util';
import { recordAudit } from './audit';
import { loadSnapshots, previousPeriod, type SnapshotRow } from './dashboard';
import { getSetting, setSetting } from './settings';

const DIAGNOSTIC_KINDS = DiagnosticKind.options;

const BASE_LIMITATIONS = [
  'Diagnósticos usam métricas diárias agregadas por campanha; não há dados por conjunto de anúncios, anúncio ou criativo.',
  'Conversões e receita seguem a janela de atribuição de cada plataforma e podem ser revisadas após a sincronização.',
  'Valores em moedas diferentes nunca são somados; comparações de CPA usam apenas campanhas na mesma moeda.',
  'Recomendações são sugestões: nenhuma alteração é feita nas plataformas sem sua decisão ou uma regra de automação aprovada.',
];

interface LastRun {
  generatedAt: string;
  period: { from: string; to: string };
  sources: MetricSource[];
  platform: Platform | null;
}

const lastRunKey = (organizationId: string) => `intelligence.lastRun.${organizationId}`;

function toDaily(rows: SnapshotRow[]): DailyRow[] {
  return rows.map((r) => ({
    campaignId: r.campaign_id,
    date: r.date,
    currency: r.currency,
    spend: r.spend,
    impressions: r.impressions,
    reach: r.reach,
    clicks: r.clicks,
    conversions: r.conversions,
    revenue: r.revenue,
  }));
}

/**
 * Executa os diagnósticos do período e substitui os achados anteriores.
 * Recomendações são preservadas entre execuções (mesma campanha e tipo),
 * mantendo a decisão do usuário (aceita, descartada, concluída).
 */
export function runDiagnostics(ctx: AppContext, organizationId: string, from: string, to: string, platform: Platform | null = null): IntelligenceReport {
  requireOrg(ctx, organizationId);
  if (to < from) throw new AppError('VALIDATION', 'Período inválido: a data final é anterior à inicial.');
  const prev = previousPeriod(from, to);
  const current = loadSnapshots(ctx, organizationId, from, to, platform);
  const previous = loadSnapshots(ctx, organizationId, prev.from, prev.to, platform);
  const campaigns = ctx.db
    .all<{ id: string; name: string; platform: Platform; currency: string; daily_budget: number | null }>(
      'SELECT id, name, platform, currency, daily_budget FROM campaigns WHERE organization_id = ?',
      [organizationId],
    )
    .map<CampaignInfo>((c) => ({ id: c.id, name: c.name, platform: c.platform, currency: c.currency, dailyBudget: c.daily_budget }));

  const findings = diagnose({ campaigns, current: toDaily(current), previous: toDaily(previous), period: { from, to } });
  const now = ctx.now();

  ctx.db.transaction(() => {
    const placeholders = DIAGNOSTIC_KINDS.map(() => '?').join(', ');
    ctx.db.run(`DELETE FROM insights WHERE organization_id = ? AND kind IN (${placeholders})`, [organizationId, ...DIAGNOSTIC_KINDS]);
    for (const f of findings) {
      const insightId = ctx.newId();
      const fingerprint = `${f.kind}:${f.campaignId}`;
      ctx.db.run(
        `INSERT INTO insights (id, organization_id, project_id, kind, title, body, evidence, period_from, period_to, confidence, campaign_id, severity, fingerprint, created_at)
         VALUES (?, ?, (SELECT project_id FROM campaigns WHERE id = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          insightId,
          organizationId,
          f.campaignId,
          f.kind,
          f.title,
          JSON.stringify({ summary: f.summary, impact: f.impact }),
          JSON.stringify(f.evidence),
          from,
          to,
          f.confidence,
          f.campaignId,
          f.severity,
          fingerprint,
          now,
        ],
      );
      const r = f.recommendation;
      ctx.db.run(
        `INSERT INTO recommendations (id, organization_id, insight_id, title, rationale, evidence, confidence, impact, risks, limitations, status, campaign_id, fingerprint, action, period_from, period_to, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(organization_id, fingerprint) DO UPDATE SET insight_id = excluded.insight_id, title = excluded.title, rationale = excluded.rationale,
           evidence = excluded.evidence, confidence = excluded.confidence, impact = excluded.impact, risks = excluded.risks, limitations = excluded.limitations,
           action = excluded.action, period_from = excluded.period_from, period_to = excluded.period_to, updated_at = excluded.updated_at`,
        [
          ctx.newId(),
          organizationId,
          insightId,
          r.title,
          r.rationale,
          JSON.stringify(f.evidence),
          f.confidence,
          f.impact,
          r.risks,
          r.limitations,
          f.campaignId,
          fingerprint,
          r.action ? JSON.stringify(r.action) : null,
          from,
          to,
          now,
          now,
        ],
      );
    }
    const sources = [...new Set(current.map((r) => r.source))];
    setSetting(ctx, lastRunKey(organizationId), { generatedAt: now, period: { from, to }, sources, platform } satisfies LastRun);
  });

  recordAudit(ctx, {
    organizationId,
    action: 'intelligence.run',
    entityType: 'insight',
    details: { from, to, platform, findings: findings.length, rows: current.length },
  });
  return getIntelligence(ctx, organizationId);
}

interface InsightRow {
  id: string;
  kind: Insight['kind'];
  severity: DiagnosticSeverity;
  campaign_id: string | null;
  campaign_name: string | null;
  platform: Platform | null;
  title: string;
  body: string;
  evidence: string;
  confidence: number | null;
  period_from: string | null;
  period_to: string | null;
  created_at: string;
}

interface RecommendationRow {
  id: string;
  insight_id: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  title: string;
  rationale: string;
  evidence: string;
  confidence: number | null;
  impact: string | null;
  risks: string | null;
  limitations: string | null;
  action: string | null;
  status: RecommendationStatus;
  period_from: string | null;
  period_to: string | null;
  created_at: string;
  updated_at: string;
}

const SEVERITY_ORDER = "CASE i.severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 WHEN 'opportunity' THEN 2 ELSE 3 END";

export function listInsights(ctx: AppContext, organizationId: string): Insight[] {
  requireOrg(ctx, organizationId);
  const placeholders = DIAGNOSTIC_KINDS.map(() => '?').join(', ');
  return ctx.db
    .all<InsightRow>(
      `SELECT i.*, c.name AS campaign_name, c.platform AS platform FROM insights i LEFT JOIN campaigns c ON c.id = i.campaign_id
       WHERE i.organization_id = ? AND i.kind IN (${placeholders}) ORDER BY ${SEVERITY_ORDER}, i.confidence DESC`,
      [organizationId, ...DIAGNOSTIC_KINDS],
    )
    .map((r) => {
      const body = parseJson<{ summary?: string; impact?: string }>(r.body, {});
      return {
        id: r.id,
        kind: r.kind,
        severity: r.severity,
        campaignId: r.campaign_id,
        campaignName: r.campaign_name,
        platform: r.platform,
        title: r.title,
        summary: body.summary ?? '',
        impact: body.impact ?? '',
        evidence: parseJson<EvidenceItem[]>(r.evidence, []),
        confidence: r.confidence ?? 0,
        periodFrom: r.period_from,
        periodTo: r.period_to,
        createdAt: r.created_at,
      };
    });
}

export function listRecommendations(ctx: AppContext, organizationId: string): Recommendation[] {
  requireOrg(ctx, organizationId);
  return ctx.db
    .all<RecommendationRow>(
      `SELECT r.*, c.name AS campaign_name FROM recommendations r LEFT JOIN campaigns c ON c.id = r.campaign_id
       WHERE r.organization_id = ? ORDER BY CASE r.status WHEN 'open' THEN 0 WHEN 'accepted' THEN 1 WHEN 'done' THEN 2 ELSE 3 END, r.confidence DESC, r.updated_at DESC`,
      [organizationId],
    )
    .map(toRecommendation);
}

function toRecommendation(r: RecommendationRow): Recommendation {
  return {
    id: r.id,
    insightId: r.insight_id,
    campaignId: r.campaign_id,
    campaignName: r.campaign_name,
    title: r.title,
    rationale: r.rationale,
    evidence: parseJson<EvidenceItem[]>(r.evidence, []),
    confidence: r.confidence,
    impact: r.impact,
    risks: r.risks,
    limitations: r.limitations,
    action: parseJson<SuggestedAction | null>(r.action, null),
    status: r.status,
    periodFrom: r.period_from,
    periodTo: r.period_to,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function getIntelligence(ctx: AppContext, organizationId: string): IntelligenceReport {
  const org = requireOrg(ctx, organizationId);
  const last = getSetting<LastRun | null>(ctx, lastRunKey(organizationId), null);
  const isDemo = bool(org.is_demo);
  const limitations = [...BASE_LIMITATIONS];
  if (isDemo) limitations.unshift('Organização de demonstração: os achados são calculados sobre dados FICTÍCIOS e servem apenas para conhecer a ferramenta.');
  return {
    isDemo,
    generatedAt: last?.generatedAt ?? null,
    period: last?.period ?? null,
    sources: last?.sources ?? [],
    insights: listInsights(ctx, organizationId),
    recommendations: listRecommendations(ctx, organizationId),
    limitations,
  };
}

export function setRecommendationStatus(ctx: AppContext, organizationId: string, id: string, status: RecommendationStatus): Recommendation {
  requireOrg(ctx, organizationId);
  const changed = ctx.db.run('UPDATE recommendations SET status = ?, updated_at = ? WHERE id = ? AND organization_id = ?', [status, ctx.now(), id, organizationId]);
  if (changed === 0) throw new AppError('NOT_FOUND', 'Recomendação não encontrada.');
  recordAudit(ctx, { organizationId, action: 'recommendation.status', entityType: 'recommendation', entityId: id, details: { status } });
  const row = ctx.db.get<RecommendationRow>(
    'SELECT r.*, c.name AS campaign_name FROM recommendations r LEFT JOIN campaigns c ON c.id = r.campaign_id WHERE r.id = ? AND r.organization_id = ?',
    [id, organizationId],
  );
  return toRecommendation(row!);
}
