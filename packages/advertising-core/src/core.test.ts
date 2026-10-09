import { describe, expect, it, vi } from 'vitest';
import { CircuitBreaker, CircuitOpenError, fetchWithRetry } from './http';
import { countCharacters, validateText } from './rules';
import { deriveMetrics, relativeChange, sumRows } from './metrics';

describe('regras de texto', () => {
  it('conta caracteres de largura dupla em dobro no Google', () => {
    expect(countCharacters('abc')).toBe(3);
    expect(countCharacters('日本', true)).toBe(4);
    expect(countCharacters('日本', false)).toBe(2);
    expect(countCharacters('café 😀')).toBe(6);
  });

  it('distingue limites rígidos e recomendados', () => {
    expect(validateText('google_rsa_headline', 'x'.repeat(31))).toMatchObject({ withinLimit: false, enforcement: 'hard' });
    expect(validateText('google_rsa_headline', 'x'.repeat(31)).message).toMatch(/rejeitará/);
    expect(validateText('meta_headline', 'x'.repeat(41)).message).toMatch(/truncado/);
    expect(validateText('generic', 'x'.repeat(5000)).withinLimit).toBe(true);
  });
});

describe('métricas', () => {
  it('impede soma de moedas diferentes', () => {
    const base = { date: 'd', spend: 1, impressions: 1, reach: null, clicks: 1, conversions: 0, revenue: null };
    expect(() => sumRows([{ ...base, currency: 'BRL' }, { ...base, currency: 'USD' }])).toThrow(/moedas diferentes/);
  });

  it('retorna null em divisões por zero', () => {
    expect(deriveMetrics({ spend: 0, impressions: 0, reach: null, clicks: 0, conversions: 0, revenue: null })).toEqual({ ctr: null, cpm: null, cpc: null, cpa: null, roas: null });
    expect(relativeChange(10, 0)).toBeNull();
    expect(relativeChange(15, 10)).toBeCloseTo(0.5);
  });
});

describe('fetchWithRetry', () => {
  const opts = { retries: 2, baseDelayMs: 1, timeoutMs: 1000, sleep: async () => {} };

  it('repete erros transitórios e devolve a resposta final', async () => {
    const f = vi.fn().mockResolvedValueOnce(new Response('', { status: 503 })).mockResolvedValueOnce(new Response('ok', { status: 200 }));
    const r = await fetchWithRetry(f, 'https://x', {}, opts);
    expect(r.status).toBe(200);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('não repete erros do cliente (4xx)', async () => {
    const f = vi.fn().mockResolvedValue(new Response('', { status: 400 }));
    const r = await fetchWithRetry(f, 'https://x', {}, opts);
    expect(r.status).toBe(400);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('abre o circuito após falhas consecutivas', async () => {
    let now = 0;
    const breaker = new CircuitBreaker(2, 1000, () => now);
    const f = vi.fn().mockRejectedValue(new Error('rede'));
    await expect(fetchWithRetry(f, 'https://x', {}, { ...opts, retries: 0 }, breaker)).rejects.toThrow('rede');
    await expect(fetchWithRetry(f, 'https://x', {}, { ...opts, retries: 0 }, breaker)).rejects.toThrow('rede');
    await expect(fetchWithRetry(f, 'https://x', {}, { ...opts, retries: 0 }, breaker)).rejects.toBeInstanceOf(CircuitOpenError);
    now = 2000;
    f.mockResolvedValueOnce(new Response('', { status: 200 }));
    await expect(fetchWithRetry(f, 'https://x', {}, opts, breaker)).resolves.toHaveProperty('status', 200);
  });
});
