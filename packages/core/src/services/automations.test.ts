import { describe, expect, it } from 'vitest';
import type { FetchLike } from '@advertex/advertising-core';
import type { AutomationRuleInput } from '@advertex/shared';
import { jsonResponse, makeTestContext } from '../testing';
import type { AppContext } from '../context';
import { createOrganization } from './organizations';
import { saveMeta, syncAccounts } from './integrations';
import { createCampaignDraft, getCampaign } from './campaigns';
import { publishCampaign, savePublishingLimits } from './publishing';
import { enableDemo } from './demo';
import { listRecommendations } from './intelligence';
import {
  createRule,
  decideApproval,
  getAutomationOverview,
  listNotifications,
  markNotificationsRead,
  runDueAutomations,
  runRule,
  setKillSwitch,
  setRuleEnabled,
  simulateRule,
  unreadNotifications,
  updateRule,
} from './automations';

const TODAY = new Date('2026-10-01T12:00:00');

function fakeMeta() {
  const state = { campaigns: [] as Array<{ id: string; name: string; status: string; daily_budget: string }>, posts: 0 };
  const fetch: FetchLike = async (url, init) => {
    const u = new URL(url);
    if (u.pathname.endsWith('/me/adaccounts')) return jsonResponse({ data: [{ account_id: '111', name: 'Conta BR', currency: 'BRL' }] });
    if (init?.method === 'POST') {
      state.posts += 1;
      const body = new URLSearchParams(String(init.body));
      if (u.pathname.endsWith('/act_111/campaigns')) {
        state.campaigns.push({ id: String(7000 + state.campaigns.length), name: body.get('name')!, status: body.get('status')!, daily_budget: body.get('daily_budget')! });
        return jsonResponse({ id: state.campaigns.at(-1)!.id });
      }
      const c = state.campaigns.find((x) => x.id === u.pathname.split('/').pop());
      if (!c) return jsonResponse({ error: { code: 100, message: 'inexistente' } }, 400);
      if (body.get('status')) c.status = body.get('status')!;
      if (body.get('daily_budget')) c.daily_budget = body.get('daily_budget')!;
      return jsonResponse({ success: true });
    }
    return jsonResponse({ data: [] });
  };
  return { state, fetch };
}

function seed(ctx: AppContext, organizationId: string, campaignId: string, spendPerDay: number, conversionsPerDay: number) {
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - i);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    ctx.db.run(
      `INSERT INTO metric_snapshots (id, organization_id, campaign_id, platform, date, currency, spend, impressions, reach, clicks, conversions, revenue, source, definition, fetched_at)
       VALUES (?, ?, ?, 'meta', ?, 'BRL', ?, 5000, NULL, 80, ?, NULL, 'meta', '', ?)`,
      [ctx.newId(), organizationId, campaignId, date, spendPerDay, conversionsPerDay, ctx.now()],
    );
  }
}

async function setup() {
  const meta = fakeMeta();
  const ctx = await makeTestContext({ fetch: meta.fetch });
  const org = createOrganization(ctx, { name: 'Org' });
  saveMeta(ctx, org.id, { accessToken: 'EAAtesteTOKENmeta1234567890abcdef', apiVersion: 'v26.0' });
  const [account] = await syncAccounts(ctx, org.id, 'meta');
  const bad = createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'Sem conversões', objective: 'OUTCOME_SALES', dailyBudget: 100, currency: 'BRL' });
  const good = createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'Eficiente', objective: 'OUTCOME_SALES', dailyBudget: 100, currency: 'BRL' });
  await publishCampaign(ctx, org.id, bad.id, account!.id);
  await publishCampaign(ctx, org.id, good.id, account!.id);
  meta.state.campaigns.forEach((c) => (c.status = 'ACTIVE'));
  ctx.db.run("UPDATE campaigns SET status = 'active' WHERE organization_id = ?", [org.id]);
  seed(ctx, org.id, bad.id, 100, 0);
  seed(ctx, org.id, good.id, 100, 10);
  return { ctx, org, bad, good, meta };
}

const pauseRule = (mode: AutomationRuleInput['mode']): AutomationRuleInput => ({
  name: 'Pausar sem conversão',
  mode,
  conditions: [
    { metric: 'spend', operator: 'gt', value: 300 },
    { metric: 'conversions', operator: 'eq', value: 0 },
  ],
  windowDays: 7,
  action: mode === 'read_only' ? { type: 'notify' } : { type: 'pause_campaign' },
});

describe('automações', () => {
  it('simula sem efeitos colaterais', async () => {
    const { ctx, org, bad, meta } = await setup();
    const sim = simulateRule(ctx, org.id, pauseRule('auto_limited'), TODAY);
    expect(sim.evaluatedCampaigns).toBe(2);
    expect(sim.matches.map((m) => m.campaignId)).toEqual([bad.id]);
    expect(sim.matches[0]!.plannedAction).toBe('Pausar campanha');
    expect(sim.matches[0]!.blockedReason).toBeNull();
    expect(getAutomationOverview(ctx, org.id).executions).toEqual([]);
    expect(meta.state.campaigns[0]!.status).toBe('ACTIVE');
  });

  it('auto limitado: pausa na plataforma uma única vez por janela', async () => {
    const { ctx, org, bad, meta } = await setup();
    const rule = createRule(ctx, org.id, pauseRule('auto_limited'));
    const first = await runRule(ctx, org.id, rule.id, TODAY);
    expect(first).toMatchObject({ matched: 1, created: 1, skipped: 0 });
    expect(getCampaign(ctx, org.id, bad.id).status).toBe('paused');
    expect(meta.state.campaigns.find((c) => c.name === 'Sem conversões')!.status).toBe('PAUSED');
    const posts = meta.state.posts;
    const second = await runRule(ctx, org.id, rule.id, TODAY);
    expect(second).toMatchObject({ matched: 1, created: 0, skipped: 1 });
    expect(meta.state.posts).toBe(posts);
    const exec = getAutomationOverview(ctx, org.id).executions[0]!;
    expect(exec).toMatchObject({ status: 'succeeded', campaignName: 'Sem conversões', simulated: false });
    expect(exec.summary).toMatch(/Investimento > 300 e Conversões = 0/);
  });

  it('aprovação: aguarda decisão, reverifica e executa ao aprovar', async () => {
    const { ctx, org, bad, meta } = await setup();
    const rule = createRule(ctx, org.id, pauseRule('approve'));
    await runRule(ctx, org.id, rule.id, TODAY);
    const ov = getAutomationOverview(ctx, org.id);
    expect(ov.pendingApprovals).toBe(1);
    expect(meta.state.campaigns[0]!.status).toBe('ACTIVE');
    const done = await decideApproval(ctx, org.id, ov.executions[0]!.id, 'approve');
    expect(done.status).toBe('succeeded');
    expect(getCampaign(ctx, org.id, bad.id).status).toBe('paused');
    await expect(decideApproval(ctx, org.id, done.id, 'approve')).rejects.toThrow(/não está aguardando/);
  });

  it('rejeitar não altera a plataforma', async () => {
    const { ctx, org, meta } = await setup();
    const rule = createRule(ctx, org.id, pauseRule('approve'));
    await runRule(ctx, org.id, rule.id, TODAY);
    const exec = getAutomationOverview(ctx, org.id).executions[0]!;
    expect((await decideApproval(ctx, org.id, exec.id, 'reject')).status).toBe('cancelled');
    expect(meta.state.campaigns[0]!.status).toBe('ACTIVE');
  });

  it('recomendação e alerta não alteram nada na plataforma', async () => {
    const { ctx, org, meta } = await setup();
    const rec = createRule(ctx, org.id, pauseRule('recommend'));
    await runRule(ctx, org.id, rec.id, TODAY);
    expect(listRecommendations(ctx, org.id)[0]!.title).toMatch(/Recomendar pausa/);
    const alert = createRule(ctx, org.id, { ...pauseRule('read_only'), name: 'Alerta' });
    await runRule(ctx, org.id, alert.id, TODAY);
    expect(listNotifications(ctx, org.id).map((n) => n.title)).toContain('Alerta: Sem conversões');
    expect(meta.state.campaigns.every((c) => c.status === 'ACTIVE')).toBe(true);
    expect(unreadNotifications(ctx, org.id)).toBe(2);
    markNotificationsRead(ctx, org.id, null);
    expect(unreadNotifications(ctx, org.id)).toBe(0);
  });

  it('aumento de orçamento respeita o teto da regra e os limites da organização', async () => {
    const { ctx, org, good } = await setup();
    savePublishingLimits(ctx, org.id, { maxDailyBudget: null, maxBudgetIncreasePercent: 20 });
    const input: AutomationRuleInput = {
      name: 'Escalar eficiente',
      mode: 'auto_limited',
      conditions: [{ metric: 'cpa', operator: 'lt', value: 20 }],
      action: { type: 'adjust_budget', changePercent: 15 },
      maxDailyBudget: 110,
    };
    expect(() => createRule(ctx, org.id, { ...input, maxDailyBudget: null })).toThrow(/teto de orçamento/);
    const sim = simulateRule(ctx, org.id, input, TODAY);
    expect(sim.matches[0]!.plannedAction).toMatch(/100,00 → R\$\s?110,00/);
    const rule = createRule(ctx, org.id, input);
    await runRule(ctx, org.id, rule.id, TODAY);
    expect(getCampaign(ctx, org.id, good.id).dailyBudget).toBe(110);
    // Já no teto: próxima janela é bloqueada com motivo explícito.
    const next = new Date(TODAY);
    next.setDate(next.getDate() + 1);
    await runRule(ctx, org.id, rule.id, next);
    expect(getAutomationOverview(ctx, org.id).executions[0]!.error).toMatch(/teto da regra/);
  });

  it('botão de emergência desliga regras e bloqueia execução e aprovação', async () => {
    const { ctx, org } = await setup();
    const rule = createRule(ctx, org.id, { ...pauseRule('approve'), enabled: true });
    await runRule(ctx, org.id, rule.id, TODAY);
    const pending = getAutomationOverview(ctx, org.id).executions[0]!;
    const ov = setKillSwitch(ctx, org.id, true);
    expect(ov.killSwitch).toBe(true);
    expect(ov.rules.every((r) => !r.enabled)).toBe(true);
    await expect(runRule(ctx, org.id, rule.id, TODAY)).rejects.toThrow(/emergência/);
    await expect(decideApproval(ctx, org.id, pending.id, 'approve')).rejects.toThrow(/emergência/);
    expect(() => setRuleEnabled(ctx, org.id, rule.id, true)).toThrow(/emergência/);
    setKillSwitch(ctx, org.id, false);
    expect(setRuleEnabled(ctx, org.id, rule.id, true).enabled).toBe(true);
  });

  it('agendador respeita frequência, expiração e habilitação', async () => {
    const { ctx, org } = await setup();
    const rule = createRule(ctx, org.id, { ...pauseRule('read_only'), enabled: true, frequency: 'daily' });
    expect(await runDueAutomations(ctx, TODAY)).toBe(1);
    expect(await runDueAutomations(ctx, TODAY)).toBe(0);
    updateRule(ctx, org.id, rule.id, { ...pauseRule('read_only'), enabled: true, expiresAt: '2026-09-01' });
    ctx.db.run('UPDATE automation_rules SET last_run_at = NULL');
    expect(await runDueAutomations(ctx, TODAY)).toBe(0);
  });

  it('demonstração apenas simula ações', async () => {
    const ctx = await makeTestContext();
    const demo = enableDemo(ctx, TODAY);
    const rule = createRule(ctx, demo.id, { name: 'Pausar CPA alto', mode: 'auto_limited', conditions: [{ metric: 'spend', operator: 'gt', value: 1 }], action: { type: 'pause_campaign' } });
    await runRule(ctx, demo.id, rule.id, TODAY);
    const ex = getAutomationOverview(ctx, demo.id).executions;
    expect(ex.length).toBe(5);
    expect(ex.every((e) => e.status === 'simulated' && e.simulated)).toBe(true);
  });

  it('valida regras', async () => {
    const { ctx, org } = await setup();
    expect(() => createRule(ctx, org.id, { ...pauseRule('read_only'), action: { type: 'pause_campaign' } })).toThrow(/somente leitura/);
    expect(() => createRule(ctx, org.id, { ...pauseRule('auto_limited'), conditions: [] })).toThrow(/ao menos uma condição/);
  });
});
