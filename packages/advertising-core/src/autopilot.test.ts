import { describe, expect, it } from 'vitest';
import { AutopilotSettings } from '@advertex/shared';
import { proposeActions, type AdInput, type TermInput } from './autopilot';

const term = (t: string, clicks: number, spend: number, conversions: number, status = 'NONE'): TermInput => ({
  term: t,
  status,
  campaignId: 'c1',
  campaignName: 'Pesquisa',
  remoteCampaignId: '111',
  remoteAdGroupId: '222',
  spend,
  impressions: clicks * 10,
  clicks,
  conversions,
});

describe('piloto automático (regras puras)', () => {
  const settings = AutopilotSettings.parse({});

  it('negativa termos que gastam sem converter e adiciona os que convertem', () => {
    const { actions } = proposeActions({
      terms: [term('comprar café especial', 140, 238, 9), term('café de graça', 31, 59, 0), term('café aurora', 60, 40, 5, 'ADDED'), term('xícara', 3, 4, 0)],
      ads: [],
      campaigns: [],
      settings,
      periodDays: 30,
      currency: 'BRL',
    });
    const neg = actions.find((a) => a.kind === 'add_negative')!;
    expect(neg).toMatchObject({ title: 'Negativar "café de graça"', target: { matchType: 'EXACT', remoteCampaignId: '111' } });
    expect(neg.confidence).toBeGreaterThan(0.8);
    expect(neg.impact).toMatch(/Economia estimada/);
    expect(actions.find((a) => a.kind === 'add_keyword')).toMatchObject({ target: { term: 'comprar café especial', remoteAdGroupId: '222' } });
    // Já é palavra-chave (ADDED) e termo com poucos cliques: sem ação.
    expect(actions.some((a) => a.target.term === 'café aurora' || a.target.term === 'xícara')).toBe(false);
  });

  it('usa a classificação da IA para negativar termos irrelevantes com poucos cliques', () => {
    const { actions } = proposeActions({
      terms: [term('comprar café', 50, 80, 4), term('vaga de emprego cafeteria', 3, 6, 0)],
      ads: [],
      campaigns: [],
      settings,
      periodDays: 30,
      currency: 'BRL',
      irrelevantTerms: new Set(['vaga de emprego cafeteria']),
    });
    expect(actions.find((a) => a.kind === 'add_negative')?.rationale).toMatch(/IA avaliou/);
  });

  it('pausa o anúncio que perde com folga, mas nunca o último do grupo', () => {
    const ad = (id: string, imp: number, clicks: number): AdInput => ({ id, platform: 'meta', remoteAdId: id, remoteAdGroupId: 'g1', campaignId: 'c1', campaignName: 'C', name: `Anúncio ${id}`, status: 'ACTIVE', impressions: imp, clicks, conversions: 0, spend: clicks });
    const { actions } = proposeActions({ terms: [], ads: [ad('1', 20000, 400), ad('2', 20000, 100)], campaigns: [], settings, periodDays: 30, currency: 'BRL' });
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({ kind: 'pause_ad', target: { remoteAdId: '2' } });
    const alone = proposeActions({ terms: [], ads: [ad('2', 20000, 100)], campaigns: [], settings, periodDays: 30, currency: 'BRL' });
    expect(alone.actions).toHaveLength(0);
  });

  it('ajusta orçamento só com CPA alvo definido', () => {
    const campaigns = [
      { campaignId: 'a', name: 'Boa', platform: 'google' as const, status: 'active', dailyBudget: 100, spend: 1000, conversions: 40, days: 14 },
      { campaignId: 'b', name: 'Cara', platform: 'meta' as const, status: 'active', dailyBudget: 100, spend: 1400, conversions: 10, days: 14 },
    ];
    const none = proposeActions({ terms: [], ads: [], campaigns, settings, periodDays: 30, currency: 'BRL' });
    expect(none.actions).toHaveLength(0);
    expect(none.notes.join(' ')).toMatch(/CPA alvo/);
    const withTarget = proposeActions({ terms: [], ads: [], campaigns, settings: { ...settings, targetCpa: 50 }, periodDays: 30, currency: 'BRL' });
    expect(withTarget.actions.map((a) => [a.kind, a.target.to])).toEqual([
      ['increase_budget', 120],
      ['decrease_budget', 80],
    ]);
  });
});
