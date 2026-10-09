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
