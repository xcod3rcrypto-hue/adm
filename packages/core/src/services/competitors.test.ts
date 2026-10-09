import { describe, expect, it, vi } from 'vitest';
import type { PageAnalysis } from '@advertex/shared';
import { fakeProvider, makeTestContext } from '../testing';
import { createOrganization } from './organizations';
import { saveAiConfig } from './ai';
import {
  addCompetitorReference,
  analyzeCompetition,
  classifyReference,
  classifyReferenceWithAi,
  createCompetitor,
  deleteCompetitor,
  getLatestCompetitiveAnalysis,
  listCompetitors,
} from './competitors';

const page = (url: string, title: string): PageAnalysis => ({
  url,
  finalUrl: url,
  fetchedAt: '2026-10-01T10:00:00.000Z',
  status: 200,
  title,
  description: 'Café especial com entrega rápida',
  headings: ['Assine e economize'],
  textExcerpt: 'Planos mensais a partir de R$ 49.',
});

describe('inteligência competitiva', () => {
  it('cadastra concorrentes e guarda origem e data de cada referência', async () => {
    const ctx = await makeTestContext();
    const org = createOrganization(ctx, { name: 'Org' });
    const c = createCompetitor(ctx, org.id, { name: 'Café Rival', websiteUrl: 'https://rival.example' });
    const ref = addCompetitorReference(ctx, org.id, c.id, page('https://rival.example/planos', 'Planos Rival'));
    expect(ref).toMatchObject({ sourceUrl: 'https://rival.example/planos', capturedAt: '2026-10-01T10:00:00.000Z', title: 'Planos Rival' });
    expect(ref.excerpt).toContain('Assine e economize');
    const classified = classifyReference(ctx, org.id, ref.id, { promise: 'Economia na assinatura', positioning: 'Preço' });
    expect(classified.promise).toBe('Economia na assinatura');
    expect(listCompetitors(ctx, org.id)[0]!.references).toHaveLength(1);
    deleteCompetitor(ctx, org.id, c.id);
    expect(listCompetitors(ctx, org.id)).toEqual([]);
  });

  it('classifica e analisa padrões com IA sem alegar dados privados', async () => {
    const generateStructured = vi.fn(async (req: { system: string; prompt: string }) => {
      expect(req.system).toMatch(/Nunca afirme conhecer campanhas privadas/);
      if (req.prompt.includes('Classifique')) {
        return { data: { promise: 'Entrega rápida', concept: 'Conveniência', audience: 'Urbanos', format: 'Landing page', positioning: 'Conveniência' }, model: 'm', usage: { inputTokens: 1, outputTokens: 1 } };
      }
      return { data: { patterns: ['Todos prometem entrega rápida'], opportunities: ['Rastreabilidade do produtor'], differentiationIdeas: ['Conheça quem plantou seu café'], caveats: ['Amostra pequena'] }, model: 'm', usage: { inputTokens: 1, outputTokens: 1 } };
    });
    const ctx = await makeTestContext({ createTextProvider: () => fakeProvider({ generateStructured: generateStructured as never }) });
    saveAiConfig(ctx, { model: 'm', apiKey: 'sk-ant-xyz-1234567890' });
    const org = createOrganization(ctx, { name: 'Org' });
    const a = createCompetitor(ctx, org.id, { name: 'Rival A' });
    const b = createCompetitor(ctx, org.id, { name: 'Rival B' });
    const ra = addCompetitorReference(ctx, org.id, a.id, page('https://a.example', 'A'));
    await expect(analyzeCompetition(ctx, org.id, null)).rejects.toThrow(/duas referências/);
    addCompetitorReference(ctx, org.id, b.id, page('https://b.example', 'B'));

    expect((await classifyReferenceWithAi(ctx, org.id, ra.id)).concept).toBe('Conveniência');
    const analysis = await analyzeCompetition(ctx, org.id, null);
    expect(analysis.patterns).toEqual(['Todos prometem entrega rápida']);
    expect(analysis.referenceCount).toBe(2);
    expect(analysis.caveats.at(-1)).toMatch(/não inclui dados de desempenho/);
    expect(getLatestCompetitiveAnalysis(ctx, org.id, null)?.id).toBe(analysis.id);
  });

  it('isola organizações', async () => {
    const ctx = await makeTestContext();
    const a = createOrganization(ctx, { name: 'A' });
    const b = createOrganization(ctx, { name: 'B' });
    const c = createCompetitor(ctx, a.id, { name: 'Rival' });
    expect(() => addCompetitorReference(ctx, b.id, c.id, page('https://x.example', 'X'))).toThrow(/não encontrado/);
    expect(() => createCompetitor(ctx, a.id, { name: 'R', websiteUrl: 'ftp://x' })).toThrow();
  });
});
