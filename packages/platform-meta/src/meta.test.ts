import { describe, expect, it, vi } from 'vitest';
import { PlatformApiError } from '@advertex/advertising-core';
import { MetaAdsAdapter, minorToMajor } from './index';

const noRetry = { retries: 0, baseDelayMs: 1, timeoutMs: 5000 };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s });

describe('MetaAdsAdapter', () => {
  it('segue a paginação somente dentro do domínio da Graph API', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes('after=2')) return json({ data: [{ account_id: '2', name: 'B' }] });
      return json({ data: [{ account_id: '1', name: 'A' }], paging: { next: 'https://graph.facebook.com/v26.0/me/adaccounts?after=2&access_token=VAZOU' } });
    });
    const a = new MetaAdsAdapter({ accessToken: 'tok', fetchImpl, retry: noRetry });
    const list = await a.listAccounts();
    expect(list.map((x) => x.remoteId)).toEqual(['1', '2']);
    // O token presente na URL de paginação é removido; autenticação só via cabeçalho.
    expect(fetchImpl.mock.calls[1]![0]).not.toContain('access_token');
  });

  it('recusa paginação para outros domínios', async () => {
    const fetchImpl = vi.fn(async () => json({ data: [], paging: { next: 'https://evil.example/steal' } }));
    const a = new MetaAdsAdapter({ accessToken: 'tok', fetchImpl, retry: noRetry });
    await expect(a.listAccounts()).rejects.toThrow(/fora do domínio/);
  });

  it('traduz erros conhecidos', async () => {
    const a = new MetaAdsAdapter({ accessToken: 'tok', retry: noRetry, fetchImpl: async () => json({ error: { code: 17, message: 'User request limit reached' } }, 400) });
    const err = await a.me().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PlatformApiError);
    expect((err as PlatformApiError).retryable).toBe(true);
    expect((err as PlatformApiError).message).toMatch(/Limite de requisições/);
  });

  it('valida IDs e versão', () => {
    expect(() => new MetaAdsAdapter({ accessToken: 't', apiVersion: '26' })).toThrow();
    const a = new MetaAdsAdapter({ accessToken: 't', fetchImpl: async () => json({ data: [] }) });
    return expect(a.listCampaigns('act_1/../../me')).rejects.toThrow(/inválido/);
  });

  it('converte unidades mínimas de moeda', () => {
    expect(minorToMajor('5000', 'BRL')).toBe(50);
    expect(minorToMajor('5000', 'JPY')).toBe(5000);
    expect(minorToMajor(undefined, 'BRL')).toBeNull();
  });
});

describe('MetaAdsAdapter — escritas', () => {
  it('cria campanha pausada, em centavos, sem retentativa automática', async () => {
    const fetchImpl = vi.fn(async () => json({ id: '120000000001' }));
    const a = new MetaAdsAdapter({ accessToken: 'tok', fetchImpl, retry: { retries: 3, baseDelayMs: 1, timeoutMs: 5000 } });
    const r = await a.createCampaign('123', { name: 'Vendas', objective: 'OUTCOME_SALES', dailyBudget: 50.5, currency: 'BRL' });
    expect(r.remoteId).toBe('120000000001');
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://graph.facebook.com/v26.0/act_123/campaigns');
    expect(init.method).toBe('POST');
    const body = new URLSearchParams(String(init.body));
    expect(body.get('status')).toBe('PAUSED');
    expect(body.get('daily_budget')).toBe('5050');
    expect(body.get('access_token')).toBeNull();
  });

  it('não repete escrita em erro 500 (evita duplicidade)', async () => {
    const fetchImpl = vi.fn(async () => json({ error: { message: 'boom', code: 2 } }, 500));
    const a = new MetaAdsAdapter({ accessToken: 'tok', fetchImpl, retry: { retries: 3, baseDelayMs: 1, timeoutMs: 5000 } });
    await expect(a.setCampaignStatus('1', '999', 'paused')).rejects.toBeInstanceOf(PlatformApiError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('localiza campanha por nome exato para verificar operações incertas', async () => {
    const a = new MetaAdsAdapter({ accessToken: 'tok', retry: noRetry, fetchImpl: async () => json({ data: [{ id: '1', name: 'Vendas 2' }, { id: '2', name: 'Vendas' }] }) });
    expect(await a.findCampaignByName('5', 'Vendas')).toBe('2');
    expect(await a.findCampaignByName('5', 'Outra')).toBeNull();
  });

  it('rejeita objetivo fora do padrão OUTCOME_* e IDs inválidos', async () => {
    const a = new MetaAdsAdapter({ accessToken: 'tok', retry: noRetry, fetchImpl: async () => json({}) });
    await expect(a.createCampaign('1', { name: 'X', objective: 'SEARCH', dailyBudget: 10, currency: 'BRL' })).rejects.toThrow(/OUTCOME/);
    await expect(a.updateDailyBudget('1', '../me', 10, 'BRL')).rejects.toThrow(/inválido/);
  });

  it('envia imagem e retorna o hash', async () => {
    const a = new MetaAdsAdapter({ accessToken: 'tok', retry: noRetry, fetchImpl: async () => json({ images: { 'a.png': { hash: 'abc123' } } }) });
    expect(await a.uploadImage('1', 'a.png', new Uint8Array([1, 2, 3]))).toEqual({ remoteId: 'abc123' });
  });
});
