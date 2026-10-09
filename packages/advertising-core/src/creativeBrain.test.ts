import { describe, expect, it } from 'vitest';
import { learningsBrief, minePatterns, ruleFeatures, studentTwoSidedP, welchConfidence, type BrainAd } from './creativeBrain';

const ad = (id: string, impressions: number, clicks: number, conversions: number, features: Record<string, string>): BrainAd => ({ id, impressions, clicks, conversions, spend: clicks, features });

describe('cérebro criativo (regras puras)', () => {
  it('extrai características objetivas do texto', () => {
    expect(ruleFeatures({ headline: 'Cansado de café amargo?', body: 'Você merece 20% OFF hoje ☕', cta: 'shop_now' })).toEqual({
      numero: 'sim',
      pergunta: 'sim',
      emoji: 'sim',
      preco_oferta: 'sim',
      urgencia_textual: 'sim',
      voce: 'sim',
      tamanho_titulo: 'curto',
      tamanho_texto: 'curto',
      cta: 'SHOP_NOW',
    });
    expect(ruleFeatures({ headline: '', body: 'Grãos especiais torrados com cuidado' })).toMatchObject({ numero: 'nao', pergunta: 'nao', voce: 'nao' });
  });

  it('encontra padrão significativo de CTR e ignora o ruído', () => {
    const ads = [
      ad('a', 20000, 400, 10, { pergunta: 'sim', tom: 'direto' }),
      ad('b', 18000, 340, 9, { pergunta: 'sim', tom: 'emocional' }),
      ad('f', 21000, 390, 9, { pergunta: 'sim', tom: 'direto' }),
      ad('c', 22000, 200, 8, { pergunta: 'nao', tom: 'direto' }),
      ad('d', 20000, 190, 7, { pergunta: 'nao', tom: 'emocional' }),
      ad('e', 19000, 185, 6, { pergunta: 'nao', tom: 'direto' }),
    ];
    const patterns = minePatterns(ads);
    const q = patterns.find((p) => p.feature === 'pergunta' && p.metric === 'ctr')!;
    expect(q).toMatchObject({ value: 'sim', direction: 'positive', ads: 3 });
    expect(q.lift).toBeGreaterThan(0.8);
    expect(q.confidence).toBeGreaterThan(0.95);
    expect(q.sentence).toMatch(/com pergunta têm CTR .*maior/);
    // "tom" tem CTR parecido entre os grupos: não vira padrão.
    expect(patterns.some((p) => p.feature === 'tom' && p.metric === 'ctr')).toBe(false);
    // Binário: só um lado (sim/não) é mantido.
    expect(patterns.filter((p) => p.feature === 'pergunta' && p.metric === 'ctr')).toHaveLength(1);
  });

  it('exige volume mínimo e dois anúncios por lado', () => {
    expect(minePatterns([ad('a', 100, 50, 1, { pergunta: 'sim' }), ad('b', 100, 1, 0, { pergunta: 'nao' })])).toEqual([]);
    expect(minePatterns([ad('a', 50000, 2000, 1, { pergunta: 'sim' }), ad('b', 50000, 500, 0, { pergunta: 'nao' }), ad('c', 50000, 510, 0, { pergunta: 'nao' })])).toEqual([]);
  });

  it('distribuição t e teste de Welch batem com valores de referência', () => {
    expect(studentTwoSidedP(2.776, 4)).toBeCloseTo(0.05, 3);
    expect(studentTwoSidedP(1.96, 1000)).toBeCloseTo(0.05, 2);
    // Dois anúncios contra dois, com muita variação: pouca confiança, mesmo com muitas impressões.
    expect(welchConfidence([0.02, 0.01], [0.009, 0.011])).toBeLessThan(0.9);
    expect(welchConfidence([0.02, 0.021, 0.019], [0.01, 0.011, 0.0095])).toBeGreaterThan(0.99);
  });

  it('resume os aprendizados fortes para os prompts', () => {
    const patterns = minePatterns([
      ad('a', 20000, 400, 10, { pergunta: 'sim' }),
      ad('b', 18000, 340, 9, { pergunta: 'sim' }),
      ad('f', 21000, 390, 9, { pergunta: 'sim' }),
      ad('c', 22000, 200, 8, { pergunta: 'nao' }),
      ad('d', 20000, 190, 7, { pergunta: 'nao' }),
    ]);
    expect(learningsBrief(patterns)).toMatch(/^\+ Anúncios com pergunta/);
    expect(learningsBrief([])).toBe('');
  });
});
