import { beforeEach, describe, expect, it } from 'vitest';
import type { AppContext } from '../context';
import { makeTestContext } from '../testing';
import { createOrganization } from './organizations';
import { createCampaignDraft } from './campaigns';
import {
  concludeExperiment,
  createExperiment,
  deleteExperiment,
  evaluateExperimentById,
  getExperiment,
  importExperimentMetrics,
  listExperiments,
  setExperimentStatus,
  updateExperiment,
} from './experiments';

let ctx: AppContext;
beforeEach(async () => {
  ctx = await makeTestContext();
});

const base = { hypothesis: 'Se destacarmos o frete grátis, o CTR aumenta', variable: 'Título', primaryMetric: 'ctr' as const };

describe('experimentos', () => {
  it('cria, edita variantes preservando IDs e conclui com vencedor', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const e = createExperiment(ctx, org.id, {
      ...base,
      variants: [
        { label: 'Controle', impressions: 10_000, clicks: 200 },
        { label: 'Frete grátis', impressions: 10_000, clicks: 300 },
      ],
    });
    expect(e.status).toBe('planned');
    expect(e.variants.map((v) => v.label)).toEqual(['Controle', 'Frete grátis']);

    const keepId = e.variants[0]!.id;
    const u = updateExperiment(ctx, org.id, e.id, {
      ...base,
      variants: [{ ...e.variants[0]!, id: keepId }, { ...e.variants[1]!, label: 'Frete grátis hoje' }],
    });
    expect(u.variants[0]!.id).toBe(keepId);
    expect(u.variants[1]!.label).toBe('Frete grátis hoje');

    expect(setExperimentStatus(ctx, org.id, e.id, 'running').status).toBe('running');
    const evaluated = evaluateExperimentById(ctx, org.id, e.id);
    expect(evaluated.result?.outcome).toBe('winner');
    expect(evaluated.status).toBe('running');

    const done = concludeExperiment(ctx, org.id, e.id, 'Frete grátis no título aumenta o CTR.');
    expect(done.status).toBe('concluded');
    expect(done.result?.winnerId).toBe(done.variants[1]!.id);
    expect(done.conclusion).toMatch(/Frete/);
    expect(() => updateExperiment(ctx, org.id, e.id, { ...base, variants: done.variants })).toThrow(/encerrados/);
  });

  it('encerra como inconclusivo quando falta significância', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const e = createExperiment(ctx, org.id, { ...base, variants: [{ label: 'A', impressions: 500, clicks: 10 }, { label: 'B', impressions: 500, clicks: 12 }] });
    const r = concludeExperiment(ctx, org.id, e.id, '');
    expect(r.status).toBe('inconclusive');
    expect(r.result?.reason).toMatch(/Volume insuficiente/);
  });

  it('importa métricas das campanhas vinculadas no período', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const c1 = createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'Campanha A', objective: 'OUTCOME_SALES' });
    const c2 = createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'Campanha B', objective: 'OUTCOME_SALES' });
    for (const [cid, clicks] of [[c1.id, 100], [c2.id, 150]] as const) {
      for (const date of ['2026-09-01', '2026-09-02', '2026-09-10']) {
        ctx.db.run(
          `INSERT INTO metric_snapshots (id, organization_id, campaign_id, platform, date, currency, spend, impressions, reach, clicks, conversions, revenue, source, definition, fetched_at)
           VALUES (?, ?, ?, 'meta', ?, 'BRL', 50, 5000, NULL, ?, 4, NULL, 'meta', '', ?)`,
          [ctx.newId(), org.id, cid, date, clicks, ctx.now()],
        );
      }
    }
    const e = createExperiment(ctx, org.id, {
      ...base,
      periodFrom: '2026-09-01',
      periodTo: '2026-09-05',
      variants: [{ label: 'A', campaignId: c1.id }, { label: 'B', campaignId: c2.id }],
    });
    const r = importExperimentMetrics(ctx, org.id, e.id);
    expect(r.variants.map((v) => [v.impressions, v.clicks, v.spend])).toEqual([
      [10_000, 200, 100],
      [10_000, 300, 100],
    ]);
  });

  it('valida entradas e isola organizações', () => {
    const a = createOrganization(ctx, { name: 'A' });
    const b = createOrganization(ctx, { name: 'B' });
    expect(() => createExperiment(ctx, a.id, { ...base, variants: [{ label: 'Só uma' }] })).toThrow(/duas variantes/);
    expect(() => createExperiment(ctx, a.id, { ...base, variants: [{ label: 'X' }, { label: 'x' }] })).toThrow(/nome diferente/);
    const cB = createCampaignDraft(ctx, b.id, { platform: 'meta', name: 'Campanha B', objective: 'OUTCOME_SALES' });
    expect(() => createExperiment(ctx, a.id, { ...base, variants: [{ label: 'A', campaignId: cB.id }, { label: 'B' }] })).toThrow(/Campanha não encontrad/);
    const e = createExperiment(ctx, a.id, { ...base, variants: [{ label: 'A' }, { label: 'B' }] });
    expect(() => getExperiment(ctx, b.id, e.id)).toThrow(/não encontrado/);
    expect(listExperiments(ctx, b.id)).toEqual([]);
    expect(() => setExperimentStatus(ctx, a.id, e.id, 'planned')).toThrow(/Não é possível/);
    deleteExperiment(ctx, a.id, e.id);
    expect(listExperiments(ctx, a.id)).toEqual([]);
  });
});
