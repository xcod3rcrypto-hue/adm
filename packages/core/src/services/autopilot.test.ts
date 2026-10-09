import { describe, expect, it, vi } from 'vitest';
import { fakeProvider, jsonResponse, makeTestContext } from '../testing';
import { saveAiConfig } from './ai';
import { applyAutopilotAction, applyAutopilotActions, dismissAutopilotAction, getAutopilotOverview, runAutopilot, saveAutopilotSettings, syncSearchTerms } from './autopilot';
import { setKillSwitch } from './automations';
import { enableDemo } from './demo';
import { createOrganization } from './organizations';

describe('piloto automático', () => {
  it('na demonstração: propõe, simula a aplicação, descarta e não repete', async () => {
    const ctx = await makeTestContext();
    const today = new Date('2026-10-09T12:00:00Z');
    const org = enableDemo(ctx, today);
    saveAutopilotSettings(ctx, org.id, { targetCpa: 40, aiRelevance: false });
    const run = await runAutopilot(ctx, org.id, {}, today);
    expect(run.proposed).toBeGreaterThan(3);
    const o = getAutopilotOverview(ctx, org.id);
    const kinds = new Set(o.proposed.map((a) => a.kind));
    expect(kinds.has('add_negative')).toBe(true);
    expect(kinds.has('add_keyword')).toBe(true);
    expect(o.savingsEstimate).toBeGreaterThan(0);
    expect(o.searchTerms.wasteful.map((t) => t.term)).toContain('café de graça');

    const neg = o.proposed.find((a) => a.kind === 'add_negative')!;
    const applied = await applyAutopilotAction(ctx, org.id, neg.id);
    expect(applied).toMatchObject({ status: 'applied', error: expect.stringMatching(/Simulado/) });
    const kw = o.proposed.find((a) => a.kind === 'add_keyword')!;
    dismissAutopilotAction(ctx, org.id, kw.id);

    // Nova análise não recria o que foi aplicado nem o que foi descartado.
    await runAutopilot(ctx, org.id, {}, today);
    const again = getAutopilotOverview(ctx, org.id);
    expect(again.proposed.some((a) => a.title === neg.title || a.title === kw.title)).toBe(false);
    expect(again.history.map((a) => a.status).sort()).toEqual(['applied', 'dismissed']);

    setKillSwitch(ctx, org.id, true);
    const next = again.proposed[0]!;
    await expect(applyAutopilotAction(ctx, org.id, next.id)).rejects.toThrow(/emergência/);
  });

  it('com Google real: importa termos, negativa via API com idempotência e a IA marca termos irrelevantes', async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const fetch = vi.fn(async (url: string, init?: RequestInit) => {
      const body = String(init?.body ?? '');
      calls.push({ url, body });
      if (url.includes('oauth2.googleapis.com/token')) return jsonResponse({ access_token: 'at', expires_in: 3600 });
      if (url.endsWith(':search') && body.includes('search_term_view')) {
        return jsonResponse({
          results: [
            { searchTermView: { searchTerm: 'internet starlink preço', status: 'NONE' }, campaign: { id: '900' }, adGroup: { id: '800' }, metrics: { costMicros: '120000000', impressions: '900', clicks: '60', conversions: 4 } },
            { searchTermView: { searchTerm: 'starlink vagas emprego', status: 'NONE' }, campaign: { id: '900' }, adGroup: { id: '800' }, metrics: { costMicros: '9000000', impressions: '50', clicks: '4', conversions: 0 } },
          ],
        });
      }
      if (url.endsWith(':search')) return jsonResponse({ results: [] });
      if (url.endsWith('campaignCriteria:mutate')) return jsonResponse({ results: [{ resourceName: 'customers/1234567890/campaignCriteria/900~1' }] });
      return jsonResponse({ results: [] });
    });
    const ctx = await makeTestContext({
      fetch: fetch as never,
      createTextProvider: () =>
        fakeProvider({ generateStructured: (async () => ({ data: { irrelevant: [{ term: 'starlink vagas emprego', reason: 'emprego' }] }, model: 'm', usage: { inputTokens: 1, outputTokens: 1 } })) as never }),
    });
    const org = createOrganization(ctx, { name: 'Org' });
    saveAiConfig(ctx, { model: 'm', apiKey: 'sk-ant-xyz-1234567890' });
    // Conta Google conectada (credenciais simuladas).
    const { saveGoogle } = await import('./integrations');
    const { putSecret, scopes } = await import('./secrets');
    saveGoogle(ctx, org.id, { clientId: '123.apps.googleusercontent.com', clientSecret: 'segredo-xyz', developerToken: 'devtoken123', loginCustomerId: '', apiVersion: 'v25' });
    putSecret(ctx, scopes.org(org.id, 'google', 'refreshToken'), org.id, 'rt');
    const accountId = ctx.newId();
    ctx.db.run(
      "INSERT INTO advertising_accounts (id, organization_id, connection_id, platform, remote_id, name, currency, created_at, updated_at, last_synced_at) SELECT ?, ?, id, 'google', '1234567890', 'Conta', 'BRL', ?, ?, ? FROM integration_connections WHERE organization_id = ? AND platform = 'google'",
      [accountId, org.id, ctx.now(), ctx.now(), ctx.now(), org.id],
    );
    expect(await syncSearchTerms(ctx, org.id, accountId, 30, new Date('2026-10-09T12:00:00Z'))).toBe(2);
    const run = await runAutopilot(ctx, org.id, { sync: false }, new Date('2026-10-09T12:00:00Z'));
    expect(run.notes.join(' ')).toMatch(/IA marcou 1 termo/);
    const o = getAutopilotOverview(ctx, org.id);
    const neg = o.proposed.find((a) => a.kind === 'add_negative')!;
    expect(neg.target.term).toBe('starlink vagas emprego');
    const res = await applyAutopilotActions(ctx, org.id, [neg.id]);
    expect(res).toEqual({ applied: 1, failed: [] });
    const mutate = calls.find((c) => c.url.endsWith('campaignCriteria:mutate'))!;
    expect(JSON.parse(mutate.body).operations[0].create).toMatchObject({ negative: true, keyword: { text: 'starlink vagas emprego', matchType: 'EXACT' } });
    // Reaplicar não chama a API de novo.
    await applyAutopilotAction(ctx, org.id, neg.id);
    expect(calls.filter((c) => c.url.endsWith('campaignCriteria:mutate'))).toHaveLength(1);
    expect(getAutopilotOverview(ctx, org.id).searchTerms.wasteful.find((t) => t.term === 'starlink vagas emprego')).toBeUndefined();
  });
});
