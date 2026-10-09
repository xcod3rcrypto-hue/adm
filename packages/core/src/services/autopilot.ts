import { normalizeTerm, proposeActions, type ActionDraft, type AdInput, type CampaignInput, type TermInput } from '@advertex/advertising-core';
import { buildTermRelevancePrompt, TermRelevanceOutput } from '@advertex/ai-core';
import {
  AppError,
  AutopilotSettings,
  isoDay,
  type AutopilotAction,
  type AutopilotActionKind,
  type AutopilotActionStatus,
  type AutopilotOverview,
  type AutopilotRunResult,
  type Platform,
  type SearchTermRow,
} from '@advertex/shared';
import type { AppContext } from '../context';
import { bool, parseJson, requireOrg } from '../util';
import { aiProvider, runAiJob } from './ai';
import { recordAudit } from './audit';
import { createNotification, isKillSwitchActive } from './automations';
import { getBrief } from './briefs';
import { getAccount, googleAdsClient, metaAdsClient, syncInsights } from './integrations';
import { getProject } from './projects';
import { runPlatformOperation, updateCampaignRemoteBudget } from './publishing';
import { getSetting, setSetting } from './settings';

/**
 * Piloto automático: lê termos de busca, anúncios e campanhas, propõe ações
 * concretas (negativar, adicionar palavra-chave, pausar anúncio, ajustar
 * orçamento) e as aplica com aprovação, idempotência e auditoria. Só aplica
 * sozinho o que o usuário liberou explicitamente (negativas), respeitando o
 * botão de emergência das automações.
 */

const settingsKey = (org: string) => `autopilot.settings.${org}`;
const lastRunKey = (org: string) => `autopilot.lastRun.${org}`;
const MAX_AUTO_PER_RUN = 20;

interface ActionRow {
  id: string;
  platform: Platform;
  advertising_account_id: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  kind: AutopilotActionKind;
  title: string;
  rationale: string;
  evidence: string;
  impact: string;
  confidence: number;
  target: string;
  monthly_savings: number;
  dedupe_key: string;
  status: AutopilotActionStatus;
  auto: number;
  error: string | null;
  created_at: string;
  applied_at: string | null;
}

const toAction = (r: ActionRow): AutopilotAction => ({
  id: r.id,
  kind: r.kind,
  platform: r.platform,
  campaignId: r.campaign_id,
  campaignName: r.campaign_name,
  title: r.title,
  rationale: r.rationale,
  evidence: parseJson<string[]>(r.evidence, []),
  impact: r.impact,
  confidence: r.confidence,
  target: parseJson<Record<string, string | number | null>>(r.target, {}),
  status: r.status,
  auto: bool(r.auto),
  error: r.error,
  createdAt: r.created_at,
  appliedAt: r.applied_at,
});

const SELECT = `SELECT a.*, c.name AS campaign_name FROM autopilot_actions a LEFT JOIN campaigns c ON c.id = a.campaign_id`;

export function getAutopilotSettings(ctx: AppContext, organizationId: string): AutopilotSettings {
  return AutopilotSettings.parse(getSetting<unknown>(ctx, settingsKey(organizationId), {}));
}

export function saveAutopilotSettings(ctx: AppContext, organizationId: string, raw: unknown): AutopilotOverview {
  requireOrg(ctx, organizationId);
  const s = AutopilotSettings.parse(raw);
  setSetting(ctx, settingsKey(organizationId), s);
  recordAudit(ctx, { organizationId, action: 'autopilot.settings', entityType: 'organization', entityId: organizationId, details: s });
  return getAutopilotOverview(ctx, organizationId);
}

function termRows(ctx: AppContext, organizationId: string) {
  return ctx.db.all<{
    id: string;
    advertising_account_id: string | null;
    campaign_id: string | null;
    campaign_name: string | null;
    remote_campaign_id: string;
    remote_ad_group_id: string;
    term: string;
    status: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    currency: string;
    period_from: string;
    period_to: string;
  }>(
    `SELECT t.*, c.name AS campaign_name FROM search_terms t LEFT JOIN campaigns c ON c.id = t.campaign_id WHERE t.organization_id = ? ORDER BY t.spend DESC`,
    [organizationId],
  );
}

export function getAutopilotOverview(ctx: AppContext, organizationId: string): AutopilotOverview {
  requireOrg(ctx, organizationId);
  const proposed = ctx.db.all<ActionRow>(`${SELECT} WHERE a.organization_id = ? AND a.status = 'proposed' ORDER BY a.monthly_savings DESC, a.confidence DESC`, [organizationId]).map(toAction);
  const history = ctx.db.all<ActionRow>(`${SELECT} WHERE a.organization_id = ? AND a.status != 'proposed' ORDER BY a.updated_at DESC LIMIT 50`, [organizationId]).map(toAction);
  const terms = termRows(ctx, organizationId);
  const toRow = (t: (typeof terms)[number]): SearchTermRow => ({
    id: t.id,
    campaignId: t.campaign_id,
    campaignName: t.campaign_name,
    term: t.term,
    status: t.status,
    spend: t.spend,
    impressions: t.impressions,
    clicks: t.clicks,
    conversions: t.conversions,
    cpa: t.conversions > 0 ? t.spend / t.conversions : null,
    currency: t.currency,
  });
  const last = getSetting<{ at: string; summary: string } | null>(ctx, lastRunKey(organizationId), null);
  const currency =
    terms[0]?.currency ??
    ctx.db.get<{ currency: string }>('SELECT currency FROM campaigns WHERE organization_id = ? ORDER BY updated_at DESC LIMIT 1', [organizationId])?.currency ??
    'BRL';
  return {
    settings: getAutopilotSettings(ctx, organizationId),
    lastRunAt: last?.at ?? null,
    lastRunSummary: last?.summary ?? null,
    killSwitch: isKillSwitchActive(ctx, organizationId),
    proposed,
    history,
    searchTerms: {
      wasteful: terms.filter((t) => t.conversions === 0 && t.status !== 'EXCLUDED').slice(0, 15).map(toRow),
      converting: terms
        .filter((t) => t.conversions > 0)
        .sort((a, b) => b.conversions - a.conversions)
        .slice(0, 15)
        .map(toRow),
      total: terms.length,
      periodFrom: terms[0]?.period_from ?? null,
      periodTo: terms[0]?.period_to ?? null,
    },
    savingsEstimate: proposed.reduce((s, a) => s + (a.kind === 'add_negative' || a.kind === 'pause_ad' || a.kind === 'decrease_budget' ? Number(a.target.monthlySavings ?? 0) : 0), 0),
    currency,
  };
}

/** Importa os termos de busca reais de uma conta Google (substitui o retrato anterior da conta). */
export async function syncSearchTerms(ctx: AppContext, organizationId: string, accountId: string, days = 30, today: Date = new Date()): Promise<number> {
  const account = getAccount(ctx, organizationId, 'google', accountId);
  const range = { from: isoDay(-days, today), to: isoDay(-1, today) };
  const rows = await googleAdsClient(ctx, organizationId).fetchSearchTerms(account.remote_id, range);
  const now = ctx.now();
  ctx.db.transaction(() => {
    ctx.db.run('DELETE FROM search_terms WHERE organization_id = ? AND advertising_account_id = ?', [organizationId, account.id]);
    for (const r of rows) {
      const camp = ctx.db.get<{ id: string }>("SELECT id FROM campaigns WHERE organization_id = ? AND platform = 'google' AND remote_id = ?", [organizationId, r.remoteCampaignId]);
      ctx.db.run(
        `INSERT INTO search_terms (id, organization_id, advertising_account_id, campaign_id, remote_campaign_id, remote_ad_group_id, term, status, period_from, period_to, currency,
           spend, impressions, clicks, conversions, revenue, fetched_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(organization_id, remote_ad_group_id, term) DO UPDATE SET status = excluded.status, spend = excluded.spend, impressions = excluded.impressions,
           clicks = excluded.clicks, conversions = excluded.conversions, revenue = excluded.revenue, period_from = excluded.period_from, period_to = excluded.period_to, fetched_at = excluded.fetched_at`,
        [ctx.newId(), organizationId, account.id, camp?.id ?? null, r.remoteCampaignId, r.remoteAdGroupId, r.term.slice(0, 300), r.status, range.from, range.to, account.currency ?? 'USD', r.spend, r.impressions, r.clicks, r.conversions, r.revenue, now],
      );
    }
  });
  recordAudit(ctx, { organizationId, action: 'autopilot.syncSearchTerms', entityType: 'advertising_account', entityId: account.id, details: { ...range, terms: rows.length } });
  return rows.length;
}

/** Termos sem conversão que a IA considera fora do negócio (melhor esforço). */
async function aiIrrelevantTerms(ctx: AppContext, organizationId: string, terms: TermInput[]): Promise<Set<string>> {
  const candidates = terms
    .filter((t) => t.conversions === 0 && t.clicks >= 2 && t.status !== 'ADDED' && t.status !== 'EXCLUDED')
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 80)
    .map((t) => t.term);
  if (candidates.length === 0) return new Set();
  const campaignId = terms.find((t) => t.campaignId)?.campaignId ?? null;
  const projectId = campaignId ? (ctx.db.get<{ project_id: string | null }>('SELECT project_id FROM campaigns WHERE id = ?', [campaignId])?.project_id ?? null) : null;
  const brief = projectId ? getBrief(ctx, organizationId, projectId) : null;
  const project = projectId ? getProject(ctx, organizationId, projectId) : null;
  const p = aiProvider(ctx);
  const prompt = buildTermRelevancePrompt({ brief: brief?.data ?? null, projectName: project?.name ?? null, terms: candidates });
  const { data } = await runAiJob(ctx, { organizationId, projectId, kind: 'autopilot.relevance' }, p, () =>
    p.generateStructured({ ...prompt, schema: TermRelevanceOutput, maxTokens: 4000, effort: 'low' }),
  );
  const allowed = new Set(candidates.map(normalizeTerm));
  return new Set(data.irrelevant.map((i) => normalizeTerm(i.term)).filter((t) => allowed.has(t)));
}

function accountFor(ctx: AppContext, organizationId: string, d: ActionDraft): string | null {
  if (d.kind === 'add_negative' || d.kind === 'add_keyword') {
    return ctx.db.get<{ id: string | null }>('SELECT advertising_account_id AS id FROM search_terms WHERE organization_id = ? AND remote_campaign_id = ? LIMIT 1', [organizationId, String(d.target.remoteCampaignId)])?.id ?? null;
  }
  if (d.kind === 'pause_ad') {
    return ctx.db.get<{ id: string | null }>('SELECT advertising_account_id AS id FROM ad_performance WHERE id = ?', [String(d.target.adPerformanceId)])?.id ?? null;
  }
  return d.campaignId ? (ctx.db.get<{ id: string | null }>('SELECT advertising_account_id AS id FROM campaigns WHERE id = ?', [d.campaignId])?.id ?? null) : null;
}

/** Analisa (opcionalmente importando dados novos) e atualiza a fila de propostas. */
export async function runAutopilot(ctx: AppContext, organizationId: string, opts: { sync?: boolean; auto?: boolean } = {}, today: Date = new Date()): Promise<AutopilotRunResult> {
  const org = requireOrg(ctx, organizationId);
  const settings = getAutopilotSettings(ctx, organizationId);
  const notes: string[] = [];
  const synced: string[] = [];

  if (opts.sync !== false && !org.is_demo) {
    const accounts = ctx.db.all<{ id: string; platform: Platform; name: string }>(
      "SELECT id, platform, name FROM advertising_accounts WHERE organization_id = ? AND name NOT LIKE '% (MCC)'",
      [organizationId],
    );
    for (const a of accounts) {
      try {
        if (a.platform === 'google') {
          const n = await syncSearchTerms(ctx, organizationId, a.id, 30, today);
          synced.push(`${a.name}: ${n} termo(s) de busca`);
        }
        await syncInsights(ctx, organizationId, a.platform, a.id, { from: isoDay(-14, today), to: isoDay(-1, today) });
      } catch (err) {
        notes.push(`${a.name}: não foi possível atualizar os dados (${err instanceof Error ? err.message : String(err)}).`);
      }
    }
    if (accounts.length === 0) notes.push('Nenhuma conta de anúncios conectada: o piloto usa apenas os dados já importados.');
  }

  const terms: TermInput[] = termRows(ctx, organizationId).map((t) => ({
    term: t.term,
    status: t.status,
    campaignId: t.campaign_id,
    campaignName: t.campaign_name,
    remoteCampaignId: t.remote_campaign_id,
    remoteAdGroupId: t.remote_ad_group_id,
    spend: t.spend,
    impressions: t.impressions,
    clicks: t.clicks,
    conversions: t.conversions,
  }));
  const ads: AdInput[] = ctx.db
    .all<{ id: string; platform: Platform; remote_ad_id: string; remote_ad_group_id: string | null; campaign_id: string | null; campaign_name: string | null; ad_name: string; status: string; impressions: number; clicks: number; conversions: number; spend: number }>(
      'SELECT p.*, c.name AS campaign_name FROM ad_performance p LEFT JOIN campaigns c ON c.id = p.campaign_id WHERE p.organization_id = ?',
      [organizationId],
    )
    .map((a) => ({ id: a.id, platform: a.platform, remoteAdId: a.remote_ad_id, remoteAdGroupId: a.remote_ad_group_id, campaignId: a.campaign_id, campaignName: a.campaign_name, name: a.ad_name, status: a.status, impressions: a.impressions, clicks: a.clicks, conversions: a.conversions, spend: a.spend }));
  const from = isoDay(-14, today);
  const campaigns: CampaignInput[] = ctx.db
    .all<{ id: string; name: string; platform: Platform; status: string; daily_budget: number | null; remote_id: string | null; spend: number | null; conversions: number | null }>(
      `SELECT c.id, c.name, c.platform, c.status, c.daily_budget, c.remote_id, SUM(m.spend) AS spend, SUM(m.conversions) AS conversions
       FROM campaigns c LEFT JOIN metric_snapshots m ON m.campaign_id = c.id AND m.date >= ?
       WHERE c.organization_id = ? AND c.status = 'active' GROUP BY c.id`,
      [from, organizationId],
    )
    .filter((c) => c.remote_id || org.is_demo)
    .map((c) => ({ campaignId: c.id, name: c.name, platform: c.platform, status: c.status, dailyBudget: c.daily_budget, spend: c.spend ?? 0, conversions: c.conversions ?? 0, days: 14 }));

  let irrelevant = new Set<string>();
  if (settings.aiRelevance && terms.length > 0) {
    try {
      irrelevant = await aiIrrelevantTerms(ctx, organizationId, terms);
      if (irrelevant.size > 0) notes.push(`A IA marcou ${irrelevant.size} termo(s) como fora do seu negócio.`);
    } catch (err) {
      notes.push(`Análise de relevância por IA indisponível (${err instanceof Error ? err.message : String(err)}); seguindo só com as regras de desempenho.`);
    }
  }

  const currency = terms.length ? (termRows(ctx, organizationId)[0]?.currency ?? 'BRL') : (ctx.db.get<{ currency: string }>('SELECT currency FROM campaigns WHERE organization_id = ? LIMIT 1', [organizationId])?.currency ?? 'BRL');
  const { actions, notes: ruleNotes } = proposeActions({ terms, ads, campaigns, settings, periodDays: 30, currency, irrelevantTerms: irrelevant });
  notes.push(...ruleNotes);

  const now = ctx.now();
  const recentCut = new Date(today.getTime() - 30 * 86_400_000).toISOString();
  const keep = new Set<string>();
  let created = 0;
  ctx.db.transaction(() => {
    for (const d of actions) {
      const prior = ctx.db.get<{ id: string; status: AutopilotActionStatus; updated_at: string }>(
        'SELECT id, status, updated_at FROM autopilot_actions WHERE organization_id = ? AND dedupe_key = ? ORDER BY updated_at DESC LIMIT 1',
        [organizationId, d.dedupeKey],
      );
      // Já aplicada ou recusada recentemente: não insiste.
      if (prior && (prior.status === 'applied' || prior.status === 'dismissed') && prior.updated_at >= recentCut) continue;
      const target = JSON.stringify({ ...d.target, monthlySavings: Math.round(d.monthlySavings * 100) / 100 });
      if (prior && (prior.status === 'proposed' || prior.status === 'failed')) {
        ctx.db.run(
          "UPDATE autopilot_actions SET title = ?, rationale = ?, evidence = ?, impact = ?, confidence = ?, target = ?, monthly_savings = ?, status = 'proposed', error = NULL, updated_at = ? WHERE id = ?",
          [d.title, d.rationale, JSON.stringify(d.evidence), d.impact, d.confidence, target, d.monthlySavings, now, prior.id],
        );
        keep.add(prior.id);
        continue;
      }
      const id = ctx.newId();
      ctx.db.run(
        `INSERT INTO autopilot_actions (id, organization_id, platform, advertising_account_id, campaign_id, kind, title, rationale, evidence, impact, confidence, target, monthly_savings, dedupe_key, status, auto, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'proposed', 0, ?, ?)`,
        [id, organizationId, d.platform, accountFor(ctx, organizationId, d), d.campaignId, d.kind, d.title, d.rationale, JSON.stringify(d.evidence), d.impact, d.confidence, target, d.monthlySavings, d.dedupeKey, now, now],
      );
      keep.add(id);
      created += 1;
    }
    // Propostas antigas que deixaram de valer (os dados mudaram) saem da fila.
    const stale = ctx.db.all<{ id: string }>("SELECT id FROM autopilot_actions WHERE organization_id = ? AND status = 'proposed'", [organizationId]).filter((r) => !keep.has(r.id));
    for (const r of stale) ctx.db.run('DELETE FROM autopilot_actions WHERE id = ?', [r.id]);
  });

  let autoApplied = 0;
  if (opts.auto && settings.autoApplyNegatives && !isKillSwitchActive(ctx, organizationId)) {
    const negatives = ctx.db
      .all<{ id: string }>("SELECT id FROM autopilot_actions WHERE organization_id = ? AND status = 'proposed' AND kind = 'add_negative' AND confidence >= 0.8 ORDER BY monthly_savings DESC LIMIT ?", [organizationId, MAX_AUTO_PER_RUN])
      .map((r) => r.id);
    for (const id of negatives) {
      try {
        await applyAutopilotAction(ctx, organizationId, id, { auto: true });
        autoApplied += 1;
      } catch {
        // falha registrada na própria ação
      }
    }
  }

  const proposedCount = ctx.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM autopilot_actions WHERE organization_id = ? AND status = 'proposed'", [organizationId])?.n ?? 0;
  const summary = `${proposedCount} ação(ões) aguardando aprovação${created ? ` (${created} nova(s))` : ''}${autoApplied ? `; ${autoApplied} negativa(s) aplicada(s) automaticamente` : ''}.`;
  setSetting(ctx, lastRunKey(organizationId), { at: now, summary });
  if (created > 0 || autoApplied > 0) createNotification(ctx, organizationId, 'info', 'Piloto automático', summary);
  recordAudit(ctx, { organizationId, action: 'autopilot.run', entityType: 'organization', entityId: organizationId, details: { created, proposed: proposedCount, autoApplied, synced: synced.length } });
  return { synced, proposed: proposedCount, autoApplied, notes };
}

function getActionRow(ctx: AppContext, organizationId: string, id: string): ActionRow {
  const row = ctx.db.get<ActionRow>(`${SELECT} WHERE a.id = ? AND a.organization_id = ?`, [id, organizationId]);
  if (!row) throw new AppError('NOT_FOUND', 'Ação do piloto automático não encontrada.');
  return row;
}

/** Aplica uma proposta na plataforma (idempotente por ação). */
export async function applyAutopilotAction(ctx: AppContext, organizationId: string, id: string, opts: { auto?: boolean } = {}): Promise<AutopilotAction> {
  const org = requireOrg(ctx, organizationId);
  const row = getActionRow(ctx, organizationId, id);
  if (row.status === 'applied') return toAction(row);
  if (row.status === 'dismissed') throw new AppError('VALIDATION', 'Esta ação foi descartada.');
  if (isKillSwitchActive(ctx, organizationId)) throw new AppError('FORBIDDEN', 'O botão de emergência das automações está ativo: nenhuma alteração é enviada às plataformas.');
  const t = parseJson<Record<string, string | number | null>>(row.target, {});
  const done = (note?: string) => {
    ctx.db.run("UPDATE autopilot_actions SET status = 'applied', auto = ?, error = ?, applied_at = ?, updated_at = ? WHERE id = ?", [opts.auto ? 1 : 0, note ?? null, ctx.now(), ctx.now(), id]);
    if (row.kind === 'pause_ad' && t.adPerformanceId) ctx.db.run("UPDATE ad_performance SET status = 'PAUSED' WHERE id = ?", [String(t.adPerformanceId)]);
    if (row.kind === 'add_negative') ctx.db.run("UPDATE search_terms SET status = 'EXCLUDED' WHERE organization_id = ? AND remote_campaign_id = ? AND lower(term) = lower(?)", [organizationId, String(t.remoteCampaignId), String(t.term)]);
    if (row.kind === 'add_keyword') ctx.db.run("UPDATE search_terms SET status = 'ADDED' WHERE organization_id = ? AND remote_ad_group_id = ? AND lower(term) = lower(?)", [organizationId, String(t.remoteAdGroupId), String(t.term)]);
    recordAudit(ctx, { organizationId, action: `autopilot.apply.${row.kind}`, entityType: 'autopilot_action', entityId: id, details: { title: row.title, auto: !!opts.auto, simulated: !!org.is_demo } });
  };

  if (org.is_demo) {
    if ((row.kind === 'increase_budget' || row.kind === 'decrease_budget') && row.campaign_id) ctx.db.run('UPDATE campaigns SET daily_budget = ? WHERE id = ?', [Number(t.to), row.campaign_id]);
    done('Simulado (demonstração): nada foi enviado às plataformas.');
    return toAction(getActionRow(ctx, organizationId, id));
  }

  try {
    if (row.kind === 'increase_budget' || row.kind === 'decrease_budget') {
      if (!row.campaign_id) throw new AppError('VALIDATION', 'Campanha não encontrada.');
      await updateCampaignRemoteBudget(ctx, organizationId, row.campaign_id, Number(t.to), { idempotencyKey: `autopilot:${id}`, actor: opts.auto ? 'automation' : 'user' });
    } else {
      if (!row.advertising_account_id) throw new AppError('VALIDATION', 'Conta de anúncios da ação não encontrada. Sincronize as contas novamente.');
      const account = getAccount(ctx, organizationId, row.platform, row.advertising_account_id);
      const spec = { organizationId, campaignId: row.campaign_id, platform: row.platform, idempotencyKey: `autopilot:${id}`, actor: opts.auto ? ('automation' as const) : ('user' as const) };
      if (row.kind === 'add_negative') {
        const client = googleAdsClient(ctx, organizationId);
        const campaign = String(t.remoteCampaignId);
        const term = String(t.term);
        await runPlatformOperation(
          ctx,
          { ...spec, operation: 'addNegativeKeyword', request: { campaign, term, matchType: 'EXACT' } },
          async () => {
            await client.addNegativeKeywords(account.remote_id, campaign, [term], 'EXACT');
            return { remoteId: null };
          },
          async () => ((await client.listNegativeKeywords(account.remote_id, campaign)).some((x) => normalizeTerm(x) === normalizeTerm(term)) ? 'ok' : null),
        );
      } else if (row.kind === 'add_keyword') {
        const client = googleAdsClient(ctx, organizationId);
        const adGroup = String(t.remoteAdGroupId);
        await runPlatformOperation(ctx, { ...spec, operation: 'addKeyword', request: { adGroup, term: t.term, matchType: 'EXACT' } }, async () => {
          await client.addKeywords(account.remote_id, adGroup, [{ text: String(t.term), matchType: 'EXACT' }]);
          return { remoteId: null };
        });
      } else if (row.kind === 'pause_ad') {
        const adId = String(t.remoteAdId);
        await runPlatformOperation(ctx, { ...spec, operation: 'pauseAd', request: { adId } }, async () => {
          if (row.platform === 'meta') await metaAdsClient(ctx, organizationId).pauseAd(adId);
          else await googleAdsClient(ctx, organizationId).pauseAd(account.remote_id, String(t.remoteAdGroupId), adId);
          return { remoteId: adId };
        });
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    ctx.db.run("UPDATE autopilot_actions SET status = 'failed', error = ?, updated_at = ? WHERE id = ?", [msg.slice(0, 1000), ctx.now(), id]);
    throw err;
  }
  done();
  return toAction(getActionRow(ctx, organizationId, id));
}

export async function applyAutopilotActions(ctx: AppContext, organizationId: string, ids: string[]): Promise<{ applied: number; failed: Array<{ id: string; error: string }> }> {
  let applied = 0;
  const failed: Array<{ id: string; error: string }> = [];
  for (const id of ids) {
    try {
      await applyAutopilotAction(ctx, organizationId, id);
      applied += 1;
    } catch (err) {
      failed.push({ id, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return { applied, failed };
}

export function dismissAutopilotAction(ctx: AppContext, organizationId: string, id: string): AutopilotOverview {
  const row = getActionRow(ctx, organizationId, id);
  if (row.status === 'applied') throw new AppError('VALIDATION', 'Ação já aplicada não pode ser descartada.');
  ctx.db.run("UPDATE autopilot_actions SET status = 'dismissed', updated_at = ? WHERE id = ?", [ctx.now(), id]);
  recordAudit(ctx, { organizationId, action: 'autopilot.dismiss', entityType: 'autopilot_action', entityId: id, details: { title: row.title } });
  return getAutopilotOverview(ctx, organizationId);
}

/** Execução diária (agendador): só para organizações que ligaram a rotina. */
export async function runDueAutopilots(ctx: AppContext, now: Date = new Date()): Promise<number> {
  const orgs = ctx.db.all<{ id: string }>('SELECT id FROM organizations WHERE is_demo = 0');
  let ran = 0;
  for (const o of orgs) {
    const s = getAutopilotSettings(ctx, o.id);
    if (!s.autoRunDaily) continue;
    const last = getSetting<{ at: string } | null>(ctx, lastRunKey(o.id), null);
    if (last && now.getTime() - new Date(last.at).getTime() < 23 * 3_600_000) continue;
    try {
      await runAutopilot(ctx, o.id, { sync: true, auto: true }, now);
      ran += 1;
    } catch (err) {
      createNotification(ctx, o.id, 'warning', 'Piloto automático', `A rotina diária falhou: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return ran;
}
