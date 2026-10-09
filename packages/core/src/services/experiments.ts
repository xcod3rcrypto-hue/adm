import { AppError, ExperimentInput, type Experiment, type ExperimentResult, type ExperimentStatus, type ExperimentVariant } from '@advertex/shared';
import { evaluateExperiment } from '@advertex/advertising-core';
import type { AppContext } from '../context';
import { parseJson, requireOrg, requireOwned } from '../util';
import { recordAudit } from './audit';

interface ExperimentRow {
  id: string;
  organization_id: string;
  project_id: string | null;
  project_name: string | null;
  hypothesis: string;
  variable: string;
  primary_metric: Experiment['primaryMetric'];
  period_from: string | null;
  period_to: string | null;
  decision_criteria: string;
  status: ExperimentStatus;
  result: string | null;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
}

interface VariantRow {
  id: string;
  label: string;
  creative_id: string | null;
  creative_title: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

function variants(ctx: AppContext, experimentId: string): ExperimentVariant[] {
  return ctx.db
    .all<VariantRow>(
      `SELECT v.*, cr.title AS creative_title, c.name AS campaign_name FROM experiment_variants v
       LEFT JOIN creatives cr ON cr.id = v.creative_id LEFT JOIN campaigns c ON c.id = v.campaign_id
       WHERE v.experiment_id = ? ORDER BY v.position`,
      [experimentId],
    )
    .map((r) => ({
      id: r.id,
      label: r.label,
      creativeId: r.creative_id,
      creativeTitle: r.creative_title,
      campaignId: r.campaign_id,
      campaignName: r.campaign_name,
      impressions: r.impressions,
      clicks: r.clicks,
      conversions: r.conversions,
      spend: r.spend,
    }));
}

function toExperiment(ctx: AppContext, r: ExperimentRow): Experiment {
  return {
    id: r.id,
    organizationId: r.organization_id,
    projectId: r.project_id,
    projectName: r.project_name,
    hypothesis: r.hypothesis,
    variable: r.variable,
    primaryMetric: r.primary_metric,
    periodFrom: r.period_from,
    periodTo: r.period_to,
    decisionCriteria: r.decision_criteria,
    status: r.status,
    variants: variants(ctx, r.id),
    result: parseJson<ExperimentResult | null>(r.result, null),
    conclusion: r.conclusion ?? '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const SELECT = 'SELECT e.*, p.name AS project_name FROM experiments e LEFT JOIN projects p ON p.id = e.project_id';

export function listExperiments(ctx: AppContext, organizationId: string): Experiment[] {
  requireOrg(ctx, organizationId);
  return ctx.db
    .all<ExperimentRow>(
      `${SELECT} WHERE e.organization_id = ? ORDER BY CASE e.status WHEN 'running' THEN 0 WHEN 'planned' THEN 1 ELSE 2 END, e.updated_at DESC`,
      [organizationId],
    )
    .map((r) => toExperiment(ctx, r));
}

export function getExperiment(ctx: AppContext, organizationId: string, id: string): Experiment {
  const row = ctx.db.get<ExperimentRow>(`${SELECT} WHERE e.id = ? AND e.organization_id = ?`, [id, organizationId]);
  if (!row) throw new AppError('NOT_FOUND', 'Experimento não encontrado.');
  return toExperiment(ctx, row);
}

function validate(ctx: AppContext, organizationId: string, raw: unknown) {
  const d = ExperimentInput.parse(raw);
  if (d.projectId) requireOwned(ctx, 'projects', d.projectId, organizationId, 'Projeto');
  for (const v of d.variants) {
    if (v.creativeId) requireOwned(ctx, 'creatives', v.creativeId, organizationId, 'Criativo');
    if (v.campaignId) requireOwned(ctx, 'campaigns', v.campaignId, organizationId, 'Campanha');
  }
  const labels = d.variants.map((v) => v.label.toLowerCase());
  if (new Set(labels).size !== labels.length) throw new AppError('VALIDATION', 'Cada variante precisa de um nome diferente.');
  return d;
}

function writeVariants(ctx: AppContext, organizationId: string, experimentId: string, list: ReturnType<typeof validate>['variants']): void {
  const now = ctx.now();
  const keep = new Set(list.map((v) => v.id).filter(Boolean));
  for (const existing of ctx.db.all<{ id: string }>('SELECT id FROM experiment_variants WHERE experiment_id = ?', [experimentId])) {
    if (!keep.has(existing.id)) ctx.db.run('DELETE FROM experiment_variants WHERE id = ?', [existing.id]);
  }
  list.forEach((v, position) => {
    const owned = v.id ? ctx.db.get('SELECT 1 AS ok FROM experiment_variants WHERE id = ? AND experiment_id = ?', [v.id, experimentId]) : null;
    if (owned) {
      ctx.db.run(
        `UPDATE experiment_variants SET label = ?, creative_id = ?, campaign_id = ?, impressions = ?, clicks = ?, conversions = ?, spend = ?, position = ?, updated_at = ? WHERE id = ?`,
        [v.label, v.creativeId, v.campaignId, v.impressions, v.clicks, v.conversions, v.spend, position, now, v.id!],
      );
    } else {
      ctx.db.run(
        `INSERT INTO experiment_variants (id, organization_id, experiment_id, label, creative_id, campaign_id, impressions, clicks, conversions, spend, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ctx.newId(), organizationId, experimentId, v.label, v.creativeId, v.campaignId, v.impressions, v.clicks, v.conversions, v.spend, position, now, now],
      );
    }
  });
}

export function createExperiment(ctx: AppContext, organizationId: string, raw: unknown): Experiment {
  requireOrg(ctx, organizationId);
  const d = validate(ctx, organizationId, raw);
  const id = ctx.newId();
  const now = ctx.now();
  ctx.db.transaction(() => {
    ctx.db.run(
      `INSERT INTO experiments (id, organization_id, project_id, hypothesis, variable, primary_metric, period_from, period_to, decision_criteria, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?, ?)`,
      [id, organizationId, d.projectId, d.hypothesis, d.variable, d.primaryMetric, d.periodFrom, d.periodTo, d.decisionCriteria, now, now],
    );
    writeVariants(ctx, organizationId, id, d.variants);
  });
  recordAudit(ctx, { organizationId, action: 'experiment.create', entityType: 'experiment', entityId: id, details: { metric: d.primaryMetric, variants: d.variants.length } });
  return getExperiment(ctx, organizationId, id);
}

function assertEditable(e: Experiment): void {
  if (e.status === 'concluded' || e.status === 'inconclusive' || e.status === 'cancelled') {
    throw new AppError('CONFLICT', 'Experimentos encerrados não podem ser editados. Reabra o experimento para alterar os dados.');
  }
}

export function updateExperiment(ctx: AppContext, organizationId: string, id: string, raw: unknown): Experiment {
  const current = getExperiment(ctx, organizationId, id);
  assertEditable(current);
  const d = validate(ctx, organizationId, raw);
  ctx.db.transaction(() => {
    ctx.db.run(
      `UPDATE experiments SET project_id = ?, hypothesis = ?, variable = ?, primary_metric = ?, period_from = ?, period_to = ?, decision_criteria = ?, result = NULL, updated_at = ?
       WHERE id = ? AND organization_id = ?`,
      [d.projectId, d.hypothesis, d.variable, d.primaryMetric, d.periodFrom, d.periodTo, d.decisionCriteria, ctx.now(), id, organizationId],
    );
    writeVariants(ctx, organizationId, id, d.variants);
  });
  recordAudit(ctx, { organizationId, action: 'experiment.update', entityType: 'experiment', entityId: id });
  return getExperiment(ctx, organizationId, id);
}

/**
 * Preenche as métricas das variantes vinculadas a campanhas, somando os
 * snapshots do período do experimento. Variantes sem campanha mantêm os
 * valores informados manualmente.
 */
export function importExperimentMetrics(ctx: AppContext, organizationId: string, id: string): Experiment {
  const e = getExperiment(ctx, organizationId, id);
  assertEditable(e);
  if (!e.periodFrom || !e.periodTo) throw new AppError('VALIDATION', 'Defina o período do experimento antes de importar métricas.');
  const linked = e.variants.filter((v) => v.campaignId);
  if (linked.length === 0) throw new AppError('VALIDATION', 'Nenhuma variante está vinculada a uma campanha. Vincule campanhas ou informe as métricas manualmente.');
  ctx.db.transaction(() => {
    for (const v of linked) {
      const t = ctx.db.get<{ impressions: number | null; clicks: number | null; conversions: number | null; spend: number | null }>(
        `SELECT SUM(impressions) AS impressions, SUM(clicks) AS clicks, SUM(conversions) AS conversions, SUM(spend) AS spend
         FROM metric_snapshots WHERE organization_id = ? AND campaign_id = ? AND date BETWEEN ? AND ?`,
        [organizationId, v.campaignId!, e.periodFrom!, e.periodTo!],
      );
      ctx.db.run('UPDATE experiment_variants SET impressions = ?, clicks = ?, conversions = ?, spend = ?, updated_at = ? WHERE id = ?', [
        t?.impressions ?? 0,
        t?.clicks ?? 0,
        t?.conversions ?? 0,
        Math.round((t?.spend ?? 0) * 100) / 100,
        ctx.now(),
        v.id,
      ]);
    }
    ctx.db.run('UPDATE experiments SET result = NULL, updated_at = ? WHERE id = ?', [ctx.now(), id]);
  });
  recordAudit(ctx, { organizationId, action: 'experiment.importMetrics', entityType: 'experiment', entityId: id, details: { variants: linked.length } });
  return getExperiment(ctx, organizationId, id);
}

/** Calcula o resultado estatístico e o grava (sem encerrar o experimento). */
export function evaluateExperimentById(ctx: AppContext, organizationId: string, id: string): Experiment {
  const e = getExperiment(ctx, organizationId, id);
  const result = evaluateExperiment(e.primaryMetric, e.variants, ctx.now());
  ctx.db.run('UPDATE experiments SET result = ?, updated_at = ? WHERE id = ? AND organization_id = ?', [JSON.stringify(result), ctx.now(), id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'experiment.evaluate', entityType: 'experiment', entityId: id, details: { outcome: result.outcome, winnerId: result.winnerId } });
  return getExperiment(ctx, organizationId, id);
}

/**
 * Encerra o experimento. O status final segue a estatística: "concluded"
 * somente com vencedor significativo; caso contrário, "inconclusive".
 */
export function concludeExperiment(ctx: AppContext, organizationId: string, id: string, conclusion: string): Experiment {
  const e = getExperiment(ctx, organizationId, id);
  assertEditable(e);
  const result = evaluateExperiment(e.primaryMetric, e.variants, ctx.now());
  const status: ExperimentStatus = result.outcome === 'winner' ? 'concluded' : 'inconclusive';
  ctx.db.run('UPDATE experiments SET status = ?, result = ?, conclusion = ?, updated_at = ? WHERE id = ? AND organization_id = ?', [
    status,
    JSON.stringify(result),
    conclusion,
    ctx.now(),
    id,
    organizationId,
  ]);
  recordAudit(ctx, { organizationId, action: 'experiment.conclude', entityType: 'experiment', entityId: id, details: { status, winnerId: result.winnerId } });
  return getExperiment(ctx, organizationId, id);
}

const TRANSITIONS: Record<ExperimentStatus, ExperimentStatus[]> = {
  planned: ['running', 'cancelled'],
  running: ['planned', 'cancelled'],
  concluded: ['running'],
  inconclusive: ['running'],
  cancelled: ['planned'],
};

export function setExperimentStatus(ctx: AppContext, organizationId: string, id: string, status: 'planned' | 'running' | 'cancelled'): Experiment {
  const e = getExperiment(ctx, organizationId, id);
  if (!TRANSITIONS[e.status].includes(status)) throw new AppError('CONFLICT', `Não é possível mudar de "${e.status}" para "${status}".`);
  ctx.db.run('UPDATE experiments SET status = ?, updated_at = ? WHERE id = ? AND organization_id = ?', [status, ctx.now(), id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'experiment.status', entityType: 'experiment', entityId: id, details: { from: e.status, to: status } });
  return getExperiment(ctx, organizationId, id);
}

export function deleteExperiment(ctx: AppContext, organizationId: string, id: string): void {
  getExperiment(ctx, organizationId, id);
  ctx.db.run('DELETE FROM experiments WHERE id = ? AND organization_id = ?', [id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'experiment.delete', entityType: 'experiment', entityId: id });
}
