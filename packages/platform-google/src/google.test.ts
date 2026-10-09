import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { GoogleAdsAdapter } from './adapter';
import { buildAuthUrl, createPkcePair, exchangeCode, refreshAccessToken } from './oauth';

const noRetry = { retries: 0, baseDelayMs: 1, timeoutMs: 5000 };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s });

describe('OAuth Google (PKCE)', () => {
  it('gera challenge S256 correspondente ao verifier', () => {
    const { verifier, challenge } = createPkcePair();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    const expected = createHash('sha256').update(verifier).digest('base64url');
    expect(challenge).toBe(expected);
  });

  it('monta a URL de autorização com escopo adwords, PKCE e state', () => {
    const u = new URL(buildAuthUrl({ clientId: 'cid', redirectUri: 'http://127.0.0.1:5555', challenge: 'ch', state: 'st' }));
    expect(u.origin).toBe('https://accounts.google.com');
    expect(u.searchParams.get('scope')).toBe('https://www.googleapis.com/auth/adwords');
    expect(u.searchParams.get('code_challenge_method')).toBe('S256');
    expect(u.searchParams.get('state')).toBe('st');
    expect(u.searchParams.get('access_type')).toBe('offline');
  });

  it('troca código por tokens e trata invalid_grant', async () => {
    const ok = vi.fn(async () => json({ access_token: 'at', refresh_token: 'rt', expires_in: 3600 }));
    const t = await exchangeCode(ok, { code: 'c', clientId: 'id', clientSecret: 's', redirectUri: 'http://127.0.0.1:1', verifier: 'v' });
    expect(t).toMatchObject({ accessToken: 'at', refreshToken: 'rt' });
    const body = new URLSearchParams(String((ok.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(body.get('code_verifier')).toBe('v');
    await expect(refreshAccessToken(async () => json({ error: 'invalid_grant' }, 400), { refreshToken: 'r', clientId: 'i', clientSecret: 's' })).rejects.toThrow(/Autorize novamente/);
  });
});

describe('GoogleAdsAdapter', () => {
  it('envia cabeçalhos obrigatórios e pagina consultas GAQL', async () => {
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      const h = init?.headers as Record<string, string>;
      expect(h['developer-token']).toBe('dev');
      expect(h['login-customer-id']).toBe('9999999999');
      expect(h.Authorization).toBe('Bearer at');
      expect(url).toContain('googleads.googleapis.com/v25/customers/1234567890/googleAds:search');
      const body = JSON.parse(String(init?.body)) as { pageToken?: string };
      if (!body.pageToken) return json({ results: [{ campaign: { id: '1', name: 'A', status: 'ENABLED', advertisingChannelType: 'SEARCH' }, campaignBudget: { amountMicros: '50000000' } }], nextPageToken: 'p2' });
      return json({ results: [{ campaign: { id: '2', name: 'B', status: 'PAUSED' } }] });
    });
    const a = new GoogleAdsAdapter({ developerToken: 'dev', loginCustomerId: '9999999999', getAccessToken: async () => 'at', fetchImpl, retry: noRetry });
    const list = await a.listCampaigns('1234567890');
    expect(list).toEqual([
      expect.objectContaining({ remoteId: '1', status: 'active', dailyBudget: 50, objective: 'SEARCH' }),
      expect.objectContaining({ remoteId: '2', status: 'paused', dailyBudget: null }),
    ]);
  });

  it('converte métricas (cost_micros) e mantém a moeda da conta', async () => {
    const a = new GoogleAdsAdapter({
      developerToken: 'dev',
      getAccessToken: async () => 'at',
      retry: noRetry,
      fetchImpl: async () => json({ results: [{ campaign: { id: '1' }, segments: { date: '2026-10-01' }, metrics: { costMicros: '12500000', impressions: '1000', clicks: '30', conversions: 2.5, conversionsValue: 300 } }] }),
    });
    const [row] = await a.fetchInsights('1234567890', { from: '2026-10-01', to: '2026-10-01' }, 'BRL');
    expect(row).toMatchObject({ spend: 12.5, impressions: 1000, clicks: 30, conversions: 2.5, revenue: 300, currency: 'BRL' });
  });

  it('traduz erro de developer token não aprovado e valida IDs/período', async () => {
    const a = new GoogleAdsAdapter({
      developerToken: 'dev',
      getAccessToken: async () => 'at',
      retry: noRetry,
      fetchImpl: async () => json({ error: { code: 403, details: [{ errors: [{ errorCode: { authorizationError: 'DEVELOPER_TOKEN_NOT_APPROVED' }, message: 'x' }] }] } }, 403),
    });
    await expect(a.listCampaigns('1234567890')).rejects.toThrow(/developer token/);
    await expect(a.listCampaigns('123-456-7890')).rejects.toThrow(/inválido/);
    await expect(a.fetchInsights('1234567890', { from: "2026-01-01' OR 1=1 --", to: '2026-01-02' })).rejects.toThrow(/Período/);
  });
});
