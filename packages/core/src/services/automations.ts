import {
  AppError,
  AutomationRuleInput,
  formatCurrency,
  isoDay,
  type AppNotification,
  type AutomationAction,
  type AutomationCondition,
  type AutomationExecution,
  type AutomationExecutionStatus,
  type AutomationFrequency,
  type AutomationMatch,
  type AutomationMetric,
  type AutomationOverview,
  type AutomationRule,
  type AutomationSimulation,
  type Platform,
} from '@advertex/shared';
import { deriveMetrics, groupBy, sumRows } from '@advertex/advertising-core';
import type { AppContext } from '../context';
import { bool, parseJson, requireOrg } from '../util';
import { recordAudit } from './audit';
import { getCampaign } from './campaigns';
import { loadSnapshots, shiftDay } from './dashboard';
import { checkBudget, getPublishingLimits, setCampaignRemoteStatus, updateCampaignRemoteBudget } from './publishing';
import { getSetting, setSetting } from './settings';

/**
 * Automações auditáveis. Modos:
 *  - read_only: só alerta (notificação).
 *  - recommend: cria uma recomendação para decisão humana.
 *  - approve: prepara a ação e aguarda aprovação explícita.
 *  - auto_limited: executa dentro dos limites (teto da regra + limites da organização).
 * Garantias: idempotência por (regra, campanha, fim da janela), verificação do
 * estado antes de agir, botão de emergência que bloqueia toda execução, e
 * organizações de demonstração sempre apenas simulam.
 */

const FREQUENCY_MS: Record<AutomationFrequency, number> = { hourly: 3_600_000, every_6_hours: 21_600_000, daily: 86_400_000 };
const APPROVAL_TTL_MS = 72 * 3_600_000;

const METRIC_LABEL: Record<AutomationMetric, string> = {
  spend: 'Investimento',
  conversions: 'Conversões',
  clicks: 'Cliques',
  impressions: 'Impressões',
  ctr: 'CTR',
  cpc: 'CPC',
  cpa: 'CPA',
  roas: 'ROAS',
};
const OP_LABEL = { gt: '>', gte: '≥', lt: '<', lte: '≤', eq: '=' } as const;

export function describeCondition(c: AutomationCondition): string {
  const value = c.metric === 'ctr' ? `${(c.value * 100).toFixed(2)}%` : String(c.value);
  return `${METRIC_LABEL[c.metric]} ${OP_LABEL[c.operator]} ${value}`;
}

const killKey = (organizationId: string) => `automation.killSwitch.${organizationId}`;

export function isKillSwitchActive(ctx: AppContext, organizationId: string): boolean {
  return getSetting<boolean>(ctx, killKey(organizationId), false);
}

// ---------------------------------------------------------------------------
// Notificações
// ---------------------------------------------------------------------------

export function createNotification(ctx: AppContext, organizationId: string, level: AppNotification['level'], title: string, body: string): void {
  ctx.db.run('INSERT INTO notifications (id, organization_id, level, title, body, created_at) VALUES (?, ?, ?, ?, ?, ?)', [ctx.newId(), organizationId, level, title, body, ctx.now()]);
}

export function listNotifications(ctx: AppContext, organizationId: string, limit = 100): AppNotification[] {
  requireOrg(ctx, organizationId);
  return ctx.db
    .all<{ id: string; level: AppNotification['level']; title: string; body: string; read_at: string | null; created_at: string }>(
      'SELECT * FROM notifications WHERE organization_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ?',
      [organizationId, limit],
    )
    .map((r) => ({ id: r.id, level: r.level, title: r.title, body: r.body, readAt: r.read_at, createdAt: r.created_at }));
}

export function markNotificationsRead(ctx: AppContext, organizationId: string, ids: string[] | null): number {
  requireOrg(ctx, organizationId);
  if (ids === null) return ctx.db.run('UPDATE notifications SET read_at = ? WHERE organization_id = ? AND read_at IS NULL', [ctx.now(), organizationId]);
  let n = 0;
  for (const id of ids) n += ctx.db.run('UPDATE notifications SET read_at = ? WHERE id = ? AND organization_id = ? AND read_at IS NULL', [ctx.now(), id, organizationId]);
  return n;
}

export function unreadNotifications(ctx: AppContext, organizationId: string): number {
  requireOrg(ctx, organizationId);
  return ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM notifications WHERE organization_id = ? AND read_at IS NULL', [organizationId])?.n ?? 0;
}

// ---------------------------------------------------------------------------
// Regras
// ---------------------------------------------------------------------------

interface RuleRow {
  id: string;
  organization_id: string;
  name: string;
  mode: AutomationRule['mode'];
  trigger_def: string;
  conditions: string;
  action: string;
  evaluation_window: string;
  frequency: string;
  max_spend: number | null;
  expires_at: string | null;
  enabled: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

function toRule(r: RuleRow): AutomationRule {
  const trigger = parseJson<{ platform?: Platform | null; campaignIds?: string[] }>(r.trigger_def, {});
  return {
    id: r.id,
    name: r.name,
    mode: r.mode,
    platform: trigger.platform ?? null,
    campaignIds: trigger.campaignIds ?? [],
    conditions: parseJson<AutomationCondition[]>(r.conditions, []),
    windowDays: Number(r.evaluation_window) || 7,
    frequency: (r.frequency as AutomationFrequency) || 'daily',
    action: parseJson<AutomationAction>(r.action, { type: 'notify' }),
    maxDailyBudget: r.max_spend,
    expiresAt: r.expires_at,
    enabled: bool(r.enabled),
    lastRunAt: r.last_run_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function listRules(ctx: AppContext, organizationId: string): AutomationRule[] {
  requireOrg(ctx, organizationId);
  return ctx.db.all<RuleRow>('SELECT * FROM automation_rules WHERE organization_id = ? ORDER BY enabled DESC, name COLLATE NOCASE', [organizationId]).map(toRule);
}

export function getRule(ctx: AppContext, organizationId: string, id: string): AutomationRule {
  const r = ctx.db.get<RuleRow>('SELECT * FROM automation_rules WHERE id = ? AND organization_id = ?', [id, organizationId]);
  if (!r) throw new AppError('NOT_FOUND', 'Regra não encontrada.');
  return toRule(r);
}

function validateRule(ctx: AppContext, organizationId: string, raw: unknown) {
  const d = AutomationRuleInput.parse(raw);
  for (const cid of d.campaignIds) {
    const c = ctx.db.get<{ platform: Platform }>('SELECT platform FROM campaigns WHERE id = ? AND organization_id = ?', [cid, organizationId]);
    if (!c) throw new AppError('NOT_FOUND', 'Campanha não encontrada.');
    if (d.platform && c.platform !== d.platform) throw new AppError('VALIDATION', 'Há campanhas de outra plataforma no escopo da regra.');
  }
  if (d.enabled && isKillSwitchActive(ctx, organizationId)) throw new AppError('CONFLICT', 'O botão de emergência está ativo. Desative-o antes de habilitar regras.');
  return d;
}

const ruleParams = (d: ReturnType<typeof validateRule>) => [
  d.name,
  d.mode,
  JSON.stringify({ platform: d.platform, campaignIds: d.campaignIds }),
  JSON.stringify(d.conditions),
  JSON.stringify(d.action),
  String(d.windowDays),
  d.frequency,
  d.maxDailyBudget,
  d.expiresAt,
  d.enabled ? 1 : 0,
];

export function createRule(ctx: AppContext, organizationId: string, raw: unknown): AutomationRule {
  requireOrg(ctx, organizationId);
  const d = validateRule(ctx, organizationId, raw);
  const id = ctx.newId();
  const now = ctx.now();
  ctx.db.run(
    `INSERT INTO automation_rules (id, organization_id, name, mode, trigger_def, conditions, action, evaluation_window, frequency, max_spend, expires_at, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, organizationId, ...ruleParams(d), now, now],
  );
  recordAudit(ctx, { organizationId, action: 'automation.rule.create', entityType: 'automation_rule', entityId: id, details: { name: d.name, mode: d.mode, action: d.action, enabled: d.enabled } });
  return getRule(ctx, organizationId, id);
}

export function updateRule(ctx: AppContext, organizationId: string, id: string, raw: unknown): AutomationRule {
  getRule(ctx, organizationId, id);
  const d = validateRule(ctx, organizationId, raw);
  ctx.db.run(
    `UPDATE automation_rules SET name = ?, mode = ?, trigger_def = ?, conditions = ?, action = ?, evaluation_window = ?, frequency = ?, max_spend = ?, expires_at = ?, enabled = ?, updated_at = ?
     WHERE id = ? AND organization_id = ?`,
    [...ruleParams(d), ctx.now(), id, organizationId],
  );
  recordAudit(ctx, { organizationId, action: 'automation.rule.update', entityType: 'automation_rule', entityId: id, details: { mode: d.mode, action: d.action, enabled: d.enabled } });
  return getRule(ctx, organizationId, id);
}

export function setRuleEnabled(ctx: AppContext, organizationId: string, id: string, enabled: boolean): AutomationRule {
  getRule(ctx, organizationId, id);
  if (enabled && isKillSwitchActive(ctx, organizationId)) throw new AppError('CONFLICT', 'O botão de emergência está ativo. Desative-o antes de habilitar regras.');
  ctx.db.run('UPDATE automation_rules SET enabled = ?, updated_at = ? WHERE id = ? AND organization_id = ?', [enabled ? 1 : 0, ctx.now(), id, organizationId]);
  recordAudit(ctx, { organizationId, action: enabled ? 'automation.rule.enable' : 'automation.rule.disable', entityType: 'automation_rule', entityId: id });
  return getRule(ctx, organizationId, id);
}

export function deleteRule(ctx: AppContext, organizationId: string, id: string): void {
  const r = getRule(ctx, organizationId, id);
  ctx.db.run('DELETE FROM automation_rules WHERE id = ? AND organization_id = ?', [id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'automation.rule.delete', entityType: 'automation_rule', entityId: id, details: { name: r.name } });
}

/** Botão de emergência: desliga todas as regras e bloqueia qualquer execução e aprovação. */
export function setKillSwitch(ctx: AppContext, organizationId: string, active: boolean): AutomationOverview {
  requireOrg(ctx, organizationId);
  ctx.db.transaction(() => {
    setSetting(ctx, killKey(organizationId), active);
    if (active) {
      ctx.db.run('UPDATE automation_rules SET enabled = 0, updated_at = ? WHERE organization_id = ? AND enabled = 1', [ctx.now(), organizationId]);
      createNotification(ctx, organizationId, 'error', 'Botão de emergência acionado', 'Todas as automações foram desligadas e nenhuma ação será executada até a liberação.');
    }
  });
  recordAudit(ctx, { organizationId, action: active ? 'automation.killSwitch.on' : 'automation.killSwitch.off', entityType: 'settings' });
  return getAutomationOverview(ctx, organizationId);
}

// ---------------------------------------------------------------------------
// Avaliação e simulação
// ---------------------------------------------------------------------------

type RuleLike = Pick<AutomationRule, 'mode' | 'platform' | 'campaignIds' | 'conditions' | 'windowDays' | 'action' | 'maxDailyBudget'>;

interface CampaignRow {
  id: string;
  name: string;
  platform: Platform;
  currency: string;
  status: string;
  daily_budget: number | null;
  remote_id: string | null;
}

function compare(value: number | null, c: AutomationCondition): boolean {
  if (value === null) return false;
  switch (c.operator) {
    case 'gt':
      return value > c.value;
    case 'gte':
      return value >= c.value;
    case 'lt':
      return value < c.value;
    case 'lte':
      return value <= c.value;
    case 'eq':
      return Math.abs(value - c.value) < 1e-9;
  }
}

interface Planned {
  description: string;
  blockedReason: string | null;
  /** Para ajustes de orçamento: novo valor calculado. */
  newBudget?: number;
  /** Nada a fazer: o estado remoto já corresponde ao desejado. */
  noop?: boolean;
}

function planAction(ctx: AppContext, organizationId: string, isDemo: boolean, rule: RuleLike, c: CampaignRow): Planned {
  const a = rule.action;
  if (rule.mode === 'read_only' || a.type === 'notify') return { description: 'Gerar alerta', blockedReason: null };
  if (rule.mode === 'recommend') {
    return { description: a.type === 'pause_campaign' ? 'Recomendar pausa' : `Recomendar ajuste de orçamento de ${a.changePercent > 0 ? '+' : ''}${a.changePercent}%`, blockedReason: null };
  }
  const blockedBase = isDemo
    ? 'Organização de demonstração: ação apenas simulada.'
    : isKillSwitchActive(ctx, organizationId)
      ? 'Botão de emergência ativo.'
      : !c.remote_id
        ? 'A campanha não existe na plataforma (rascunho local).'
        : null;
  if (a.type === 'pause_campaign') {
    if (c.status === 'paused') return { description: 'Pausar campanha', blockedReason: null, noop: true };
    return { description: 'Pausar campanha', blockedReason: blockedBase };
  }
  // adjust_budget
  if (c.daily_budget === null || c.daily_budget <= 0) return { description: 'Ajustar orçamento', blockedReason: blockedBase ?? 'Orçamento diário atual desconhecido.' };
  let next = Math.round(c.daily_budget * (1 + a.changePercent / 100) * 100) / 100;
  if (a.changePercent > 0 && rule.maxDailyBudget !== null) {
    if (c.daily_budget >= rule.maxDailyBudget) {
      return { description: 'Aumentar orçamento', blockedReason: blockedBase ?? `Orçamento já está no teto da regra (${formatCurrency(rule.maxDailyBudget, c.currency)}).` };
    }
    next = Math.min(next, rule.maxDailyBudget);
  }
  const description = `Orçamento ${formatCurrency(c.daily_budget, c.currency)} → ${formatCurrency(next, c.currency)}`;
  const limitProblem = checkBudget(getPublishingLimits(ctx, organizationId), next, c.currency, c.daily_budget);
  return { description, blockedReason: blockedBase ?? limitProblem, newBudget: next };
}

function evaluate(ctx: AppContext, organizationId: string, rule: RuleLike, today: Date): { window: { from: string; to: string }; evaluated: number; matches: Array<AutomationMatch & { plan: Planned }> } {
  const org = requireOrg(ctx, organizationId);
  const to = isoDay(0, today);
  const from = shiftDay(to, -(rule.windowDays - 1));
  const rows = loadSnapshots(ctx, organizationId, from, to, rule.platform);
  const scope = new Set(rule.campaignIds);
  const campaigns = new Map(
    ctx.db
      .all<CampaignRow>('SELECT id, name, platform, currency, status, daily_budget, remote_id FROM campaigns WHERE organization_id = ?', [organizationId])
      .map((c) => [c.id, c]),
  );
  const byCampaign = [...groupBy(rows, (r) => r.campaign_id)].filter(([id]) => scope.size === 0 || scope.has(id));
  const matches: Array<AutomationMatch & { plan: Planned }> = [];
  for (const [campaignId, list] of byCampaign) {
    const c = campaigns.get(campaignId);
    if (!c) continue;
    const t = sumRows(list);
    const d = deriveMetrics(t);
    const metrics: Record<AutomationMetric, number | null> = {
      spend: t.spend,
      conversions: t.conversions,
      clicks: t.clicks,
      impressions: t.impressions,
      ctr: d.ctr,
      cpc: d.cpc,
      cpa: d.cpa,
      roas: d.roas,
    };
    if (!rule.conditions.every((cond) => compare(metrics[cond.metric], cond))) continue;
    const plan = planAction(ctx, organizationId, bool(org.is_demo), rule, c);
    matches.push({ campaignId, campaignName: c.name, platform: c.platform, currency: c.currency, metrics, plannedAction: plan.description, blockedReason: plan.blockedReason, plan });
  }
  return { window: { from, to }, evaluated: byCampaign.length, matches };
}

/** Simula uma regra (salva ou não) sem nenhum efeito colateral. */
export function simulateRule(ctx: AppContext, organizationId: string, raw: unknown, today: Date = new Date()): AutomationSimulation {
  const org = requireOrg(ctx, organizationId);
  const rule = AutomationRuleInput.parse(raw);
  const r = evaluate(ctx, organizationId, rule, today);
  const notes = [
    'Simulação: nada foi alterado nas plataformas nem registrado como execução.',
    'Somente campanhas com métricas na janela são avaliadas; todas as condições precisam ser verdadeiras.',
  ];
  if (bool(org.is_demo)) notes.unshift('Organização de demonstração: métricas fictícias.');
  if (r.evaluated === 0) notes.push('Nenhuma campanha com métricas na janela de avaliação.');
  return { window: r.window, evaluatedCampaigns: r.evaluated, matches: r.matches.map(({ plan: _p, ...m }) => m), notes };
}

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------

interface ExecRow {
  id: string;
  rule_id: string;
  rule_name: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  status: AutomationExecutionStatus;
  simulated: number;
  request: string;
  result: string | null;
  error: string | null;
  approval_id: string | null;
  idempotency_key: string;
  created_at: string;
  finished_at: string | null;
}

function toExecution(r: ExecRow): AutomationExecution {
  const req = parseJson<{ summary?: string; metrics?: Record<string, number | null> }>(r.request, {});
  return {
    id: r.id,
    ruleId: r.rule_id,
    ruleName: r.rule_name ?? '(regra excluída)',
    campaignId: r.campaign_id,
    campaignName: r.campaign_name,
    status: r.status,
    simulated: bool(r.simulated),
    summary: req.summary ?? '',
    metrics: req.metrics ?? {},
    result: r.result,
    error: r.error,
    createdAt: r.created_at,
    finishedAt: r.finished_at,
  };
}

const EXEC_SELECT = `SELECT e.*, r.name AS rule_name, c.name AS campaign_name FROM automation_executions e
  LEFT JOIN automation_rules r ON r.id = e.rule_id LEFT JOIN campaigns c ON c.id = e.campaign_id`;

export function listExecutions(ctx: AppContext, organizationId: string, limit = 50): AutomationExecution[] {
  requireOrg(ctx, organizationId);
  return ctx.db.all<ExecRow>(`${EXEC_SELECT} WHERE e.organization_id = ? ORDER BY e.created_at DESC, e.rowid DESC LIMIT ?`, [organizationId, limit]).map(toExecution);
}

export function getAutomationOverview(ctx: AppContext, organizationId: string): AutomationOverview {
  const org = requireOrg(ctx, organizationId);
  return {
    isDemo: bool(org.is_demo),
    killSwitch: isKillSwitchActive(ctx, organizationId),
    rules: listRules(ctx, organizationId),
    executions: listExecutions(ctx, organizationId),
    pendingApprovals: ctx.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM automation_executions WHERE organization_id = ? AND status = 'pending_approval'", [organizationId])?.n ?? 0,
  };
}

function finishExec(ctx: AppContext, id: string, status: AutomationExecutionStatus, result: string | null, error: string | null = null): void {
  ctx.db.run('UPDATE automation_executions SET status = ?, result = ?, error = ?, finished_at = ? WHERE id = ?', [status, result, error, ctx.now(), id]);
}

async function applyAction(ctx: AppContext, organizationId: string, campaignId: string, action: AutomationAction, newBudget: number | undefined, key: string): Promise<string> {
  if (action.type === 'pause_campaign') {
    await setCampaignRemoteStatus(ctx, organizationId, campaignId, 'paused', { idempotencyKey: `automation:${key}`, actor: 'automation' });
    return 'Campanha pausada na plataforma.';
  }
  if (action.type === 'adjust_budget' && newBudget !== undefined) {
    const c = await updateCampaignRemoteBudget(ctx, organizationId, campaignId, newBudget, { idempotencyKey: `automation:${key}`, actor: 'automation' });
    return `Orçamento diário atualizado para ${formatCurrency(c.dailyBudget, c.currency)}.`;
  }
  return 'Nenhuma ação na plataforma.';
}

export interface RunSummary {
  matched: number;
  created: number;
  skipped: number;
  message: string;
}

/** Avalia a regra agora e registra execuções (uma por campanha por janela). */
export async function runRule(ctx: AppContext, organizationId: string, ruleId: string, today: Date = new Date()): Promise<RunSummary> {
  const org = requireOrg(ctx, organizationId);
  const rule = getRule(ctx, organizationId, ruleId);
  if (rule.expiresAt && rule.expiresAt < isoDay(0, today)) throw new AppError('CONFLICT', `A regra expirou em ${rule.expiresAt}. Atualize a data de expiração para executá-la.`);
  const writes = rule.mode === 'approve' || rule.mode === 'auto_limited';
  if (writes && rule.action.type !== 'notify' && isKillSwitchActive(ctx, organizationId)) {
    throw new AppError('CONFLICT', 'O botão de emergência está ativo: nenhuma automação é executada.');
  }
  const r = evaluate(ctx, organizationId, rule, today);
  let created = 0;
  let skipped = 0;

  for (const m of r.matches) {
    const key = `${rule.id}:${m.campaignId}:${r.window.to}`;
    if (ctx.db.get('SELECT 1 AS ok FROM automation_executions WHERE idempotency_key = ?', [key])) {
      skipped += 1;
      continue;
    }
    const summary = `${rule.conditions.map(describeCondition).join(' e ')} (${r.window.from} a ${r.window.to}) → ${m.plannedAction}`;
    const execId = ctx.newId();
    const simulated = bool(org.is_demo) && writes && rule.action.type !== 'notify';
    ctx.db.run(
      `INSERT INTO automation_executions (id, organization_id, rule_id, idempotency_key, status, simulated, request, campaign_id, created_at)
       VALUES (?, ?, ?, ?, 'running', ?, ?, ?, ?)`,
      [execId, organizationId, rule.id, key, simulated ? 1 : 0, JSON.stringify({ summary, metrics: m.metrics, action: rule.action, newBudget: m.plan.newBudget ?? null }), m.campaignId, ctx.now()],
    );
    created += 1;
    const title = `${rule.name}: ${m.campaignName}`;

    if (rule.mode === 'read_only' || rule.action.type === 'notify') {
      finishExec(ctx, execId, 'succeeded', 'Alerta gerado.');
      createNotification(ctx, organizationId, 'warning', title, summary);
      continue;
    }
    if (rule.mode === 'recommend') {
      const now = ctx.now();
      ctx.db.run(
        `INSERT INTO recommendations (id, organization_id, title, rationale, evidence, confidence, status, campaign_id, fingerprint, action, period_from, period_to, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NULL, 'open', ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(organization_id, fingerprint) DO UPDATE SET status = 'open', rationale = excluded.rationale, evidence = excluded.evidence,
           period_from = excluded.period_from, period_to = excluded.period_to, updated_at = excluded.updated_at`,
        [
          ctx.newId(),
          organizationId,
          `${m.plannedAction} — regra "${rule.name}"`,
          `A regra de automação "${rule.name}" detectou: ${rule.conditions.map(describeCondition).join(' e ')}.`,
          JSON.stringify(Object.entries(m.metrics).filter(([, v]) => v !== null).map(([k, v]) => ({ label: METRIC_LABEL[k as AutomationMetric], value: String(Math.round((v as number) * 10000) / 10000) }))),
          m.campaignId,
          `automation:${rule.id}:${m.campaignId}`,
          JSON.stringify(rule.action.type === 'pause_campaign' ? { type: 'pause_campaign' } : { type: 'adjust_budget', changePercent: rule.action.changePercent }),
          r.window.from,
          r.window.to,
          now,
          now,
        ],
      );
      finishExec(ctx, execId, 'succeeded', 'Recomendação criada em Inteligência.');
      createNotification(ctx, organizationId, 'info', title, `Nova recomendação: ${m.plannedAction}.`);
      continue;
    }
    if (m.plan.noop) {
      finishExec(ctx, execId, 'succeeded', 'Nenhuma alteração necessária: o estado na plataforma já corresponde à ação.');
      continue;
    }
    if (simulated) {
      finishExec(ctx, execId, 'simulated', `Simulado (demonstração): ${m.plannedAction}.`);
      continue;
    }
    if (m.plan.blockedReason) {
      finishExec(ctx, execId, 'cancelled', null, m.plan.blockedReason);
      createNotification(ctx, organizationId, 'warning', title, `Ação não executada: ${m.plan.blockedReason}`);
      continue;
    }
    if (rule.mode === 'approve') {
      const approvalId = ctx.newId();
      ctx.db.run("INSERT INTO approvals (id, organization_id, entity_type, entity_id, requested_by, status, reason, created_at) VALUES (?, ?, 'automation_execution', ?, 'automation', 'pending', ?, ?)", [
        approvalId,
        organizationId,
        execId,
        summary,
        ctx.now(),
      ]);
      ctx.db.run("UPDATE automation_executions SET status = 'pending_approval', approval_id = ? WHERE id = ?", [approvalId, execId]);
      createNotification(ctx, organizationId, 'warning', `Aprovação necessária — ${title}`, summary);
      continue;
    }
    // auto_limited
    try {
      const result = await applyAction(ctx, organizationId, m.campaignId, rule.action, m.plan.newBudget, key);
      finishExec(ctx, execId, 'succeeded', result);
      createNotification(ctx, organizationId, 'info', title, result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      finishExec(ctx, execId, 'failed', null, msg);
      createNotification(ctx, organizationId, 'error', `Falha na automação — ${title}`, msg);
    }
  }

  ctx.db.run('UPDATE automation_rules SET last_run_at = ? WHERE id = ?', [ctx.now(), rule.id]);
  recordAudit(ctx, { organizationId, action: 'automation.rule.run', entityType: 'automation_rule', entityId: rule.id, details: { matched: r.matches.length, created, skipped, window: r.window } });
  const message =
    r.matches.length === 0
      ? `Nenhuma campanha atendeu às condições (${r.evaluated} avaliada(s)).`
      : `${r.matches.length} campanha(s) atenderam às condições: ${created} nova(s) execução(ões)${skipped ? `, ${skipped} já processada(s) nesta janela` : ''}.`;
  return { matched: r.matches.length, created, skipped, message };
}

/** Decide uma aprovação pendente. Aprovar executa a ação após reverificar estado e limites. */
export async function decideApproval(ctx: AppContext, organizationId: string, executionId: string, decision: 'approve' | 'reject'): Promise<AutomationExecution> {
  requireOrg(ctx, organizationId);
  const exec = ctx.db.get<ExecRow>(`${EXEC_SELECT} WHERE e.id = ? AND e.organization_id = ?`, [executionId, organizationId]);
  if (!exec) throw new AppError('NOT_FOUND', 'Execução não encontrada.');
  if (exec.status !== 'pending_approval' || !exec.approval_id) throw new AppError('CONFLICT', 'Esta execução não está aguardando aprovação.');
  const approval = ctx.db.get<{ created_at: string }>('SELECT created_at FROM approvals WHERE id = ?', [exec.approval_id])!;
  const decide = (status: 'approved' | 'rejected' | 'expired') =>
    ctx.db.run("UPDATE approvals SET status = ?, decided_by = 'local-user', decided_at = ? WHERE id = ?", [status, ctx.now(), exec.approval_id]);

  if (Date.parse(ctx.now()) - Date.parse(approval.created_at) > APPROVAL_TTL_MS) {
    decide('expired');
    finishExec(ctx, exec.id, 'cancelled', null, 'Aprovação expirada (mais de 72 horas). As métricas podem ter mudado; aguarde a próxima avaliação.');
    throw new AppError('CONFLICT', 'Aprovação expirada: as condições podem ter mudado. Aguarde a próxima avaliação da regra.');
  }
  if (decision === 'reject') {
    decide('rejected');
    finishExec(ctx, exec.id, 'cancelled', 'Rejeitada pelo usuário.');
    recordAudit(ctx, { organizationId, action: 'automation.approval.reject', entityType: 'automation_execution', entityId: exec.id });
    return toExecution(ctx.db.get<ExecRow>(`${EXEC_SELECT} WHERE e.id = ?`, [exec.id])!);
  }
  if (isKillSwitchActive(ctx, organizationId)) throw new AppError('CONFLICT', 'O botão de emergência está ativo: nenhuma ação é executada.');

  const req = parseJson<{ action: AutomationAction; newBudget: number | null }>(exec.request, { action: { type: 'notify' }, newBudget: null });
  const rule = ctx.db.get<RuleRow>('SELECT * FROM automation_rules WHERE id = ?', [exec.rule_id]);
  if (!exec.campaign_id || !rule) throw new AppError('CONFLICT', 'A regra ou a campanha desta execução não existe mais.');
  // Reverifica estado e limites no momento da aprovação.
  const c = getCampaign(ctx, organizationId, exec.campaign_id);
  const plan = planAction(ctx, organizationId, false, toRule(rule), {
    id: c.id,
    name: c.name,
    platform: c.platform,
    currency: c.currency,
    status: c.status,
    daily_budget: c.dailyBudget,
    remote_id: c.remoteId,
  });
  decide('approved');
  recordAudit(ctx, { organizationId, action: 'automation.approval.approve', entityType: 'automation_execution', entityId: exec.id });
  if (plan.noop) {
    finishExec(ctx, exec.id, 'succeeded', 'Nenhuma alteração necessária: o estado na plataforma já corresponde à ação.');
  } else if (plan.blockedReason) {
    finishExec(ctx, exec.id, 'cancelled', null, plan.blockedReason);
  } else {
    ctx.db.run("UPDATE automation_executions SET status = 'running' WHERE id = ?", [exec.id]);
    try {
      const result = await applyAction(ctx, organizationId, c.id, req.action, plan.newBudget ?? req.newBudget ?? undefined, exec.idempotency_key);
      finishExec(ctx, exec.id, 'succeeded', result);
    } catch (err) {
      finishExec(ctx, exec.id, 'failed', null, err instanceof Error ? err.message : String(err));
    }
  }
  return toExecution(ctx.db.get<ExecRow>(`${EXEC_SELECT} WHERE e.id = ?`, [exec.id])!);
}

/**
 * Agendador: executa regras habilitadas, não expiradas e vencidas segundo a
 * frequência. Chamado periodicamente pelo processo principal enquanto o app
 * está aberto. Falhas de uma regra não interrompem as demais.
 */
export async function runDueAutomations(ctx: AppContext, now: Date = new Date()): Promise<number> {
  const rules = ctx.db.all<RuleRow>('SELECT * FROM automation_rules WHERE enabled = 1');
  let ran = 0;
  for (const row of rules) {
    const rule = toRule(row);
    if (isKillSwitchActive(ctx, row.organization_id)) continue;
    if (rule.expiresAt && rule.expiresAt < isoDay(0, now)) continue;
    if (rule.lastRunAt && now.getTime() - Date.parse(rule.lastRunAt) < FREQUENCY_MS[rule.frequency]) continue;
    try {
      await runRule(ctx, row.organization_id, rule.id, now);
      ran += 1;
    } catch (err) {
      ctx.logger.warn('automation.run.failed', { ruleId: rule.id, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return ran;
}
