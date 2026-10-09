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

describe('GoogleAdsAdapter — escritas', () => {
  const make = (fetchImpl: (url: string, init?: RequestInit) => Promise<Response>) =>
    new GoogleAdsAdapter({ developerToken: 'dev', getAccessToken: async () => 'at', fetchImpl, retry: { retries: 3, baseDelayMs: 1, timeoutMs: 5000 } });

  it('cria orçamento e campanha de Pesquisa pausada', async () => {
    const calls: Array<{ url: string; body: { operations: Array<Record<string, Record<string, unknown>>> } }> = [];
    const a = make(async (url, init) => {
      calls.push({ url, body: JSON.parse(String(init?.body)) });
      if (url.endsWith('campaignBudgets:mutate')) return json({ results: [{ resourceName: 'customers/1234567890/campaignBudgets/77' }] });
      return json({ results: [{ resourceName: 'customers/1234567890/campaigns/555' }] });
    });
    const r = await a.createCampaign('1234567890', { name: 'Pesquisa', objective: 'SEARCH', dailyBudget: 25, currency: 'BRL' });
    expect(r.remoteId).toBe('555');
    expect(calls[0]!.body.operations[0]!.create!.amountMicros).toBe('25000000');
    const camp = calls[1]!.body.operations[0]!.create!;
    expect(camp.status).toBe('PAUSED');
    expect(camp.campaignBudget).toBe('customers/1234567890/campaignBudgets/77');
  });

  it('remove o orçamento órfão se a campanha falhar e não repete a mutação', async () => {
    const urls: string[] = [];
    const a = make(async (url, init) => {
      urls.push(`${url} ${String(init?.body).includes('remove') ? 'remove' : ''}`);
      if (url.endsWith('campaignBudgets:mutate')) return json({ results: [{ resourceName: 'customers/1234567890/campaignBudgets/77' }] });
      return json({ error: { code: 500, message: 'interno' } }, 500);
    });
    await expect(a.createCampaign('1234567890', { name: 'P', objective: 'SEARCH', dailyBudget: 10, currency: 'BRL' })).rejects.toThrow();
    expect(urls.filter((u) => u.includes('campaigns:mutate'))).toHaveLength(1);
    expect(urls.at(-1)).toMatch(/campaignBudgets:mutate remove/);
  });

  it('recusa tipos de campanha não suportados na criação', async () => {
    const a = make(async () => json({}));
    await expect(a.createCampaign('1234567890', { name: 'P', objective: 'PERFORMANCE_MAX', dailyBudget: 10, currency: 'BRL' })).rejects.toThrow(/apenas campanhas de Pesquisa/);
  });

  it('altera status com updateMask e escapa nomes em GAQL', async () => {
    const bodies: string[] = [];
    const a = make(async (_url, init) => {
      bodies.push(String(init?.body));
      return json({ results: [] });
    });
    await a.setCampaignStatus('1234567890', '555', 'active');
    expect(JSON.parse(bodies[0]!).operations[0]).toEqual({ update: { resourceName: 'customers/1234567890/campaigns/555', status: 'ENABLED' }, updateMask: 'status' });
    await a.findCampaignByName('1234567890', "D'Ávila");
    expect(JSON.parse(bodies[1]!).query).toContain("campaign.name = 'D\\'Ávila'");
  });

  it('atualiza orçamento buscando o recurso da campanha', async () => {
    const bodies: Array<Record<string, unknown>> = [];
    const a = make(async (url, init) => {
      bodies.push(JSON.parse(String(init?.body)));
      if (url.endsWith('googleAds:search')) return json({ results: [{ campaign: { campaignBudget: 'customers/1234567890/campaignBudgets/9' } }] });
      return json({ results: [{ resourceName: 'customers/1234567890/campaignBudgets/9' }] });
    });
    await a.updateDailyBudget('1234567890', '555', 42);
    expect(bodies[1]).toEqual({ operations: [{ update: { resourceName: 'customers/1234567890/campaignBudgets/9', amountMicros: '42000000' }, updateMask: 'amount_micros' }] });
  });
});

describe('toGoogleError — mensagens orientadas', () => {
  it('explica conta MCC e projeto restrito a contas de teste', async () => {
    const { toGoogleError } = await import('./adapter');
    const mcc = toGoogleError(400, { error: { code: 400, message: 'x', details: [{ errors: [{ errorCode: { contextError: 'OPERATION_NOT_PERMITTED_FOR_CONTEXT' }, message: 'The operation is not allowed for the given context.' }] }] } });
    expect(mcc.message).toMatch(/administrador \(MCC\)/);
    const test = toGoogleError(403, { error: { code: 403, message: 'The Google Cloud project is only approved for use with test accounts. To access non-test accounts, apply for Explorer, Basic or Standard access.' } });
    expect(test.message).toMatch(/só tem acesso a contas de teste/);
  });
});

describe('erros detalhados na criação', () => {
  it('informa etapa, código, campo e request-id', async () => {
    const a = new GoogleAdsAdapter({
      developerToken: 'dev',
      getAccessToken: async () => 'at',
      retry: { retries: 0, baseDelayMs: 1, timeoutMs: 5000 },
      fetchImpl: async (url) =>
        url.endsWith('campaignBudgets:mutate')
          ? json({
              error: {
                code: 400,
                message: 'Request contains an invalid argument.',
                status: 'INVALID_ARGUMENT',
                details: [{ requestId: 'abc123', errors: [{ errorCode: { fieldError: 'REQUIRED' }, message: 'The required field was not present.', location: { fieldPathElements: [{ fieldName: 'operations' }, { fieldName: 'create' }, { fieldName: 'amount_micros' }] } }] }],
              },
            }, 400)
          : json({}),
    });
    await expect(a.createCampaign('1234567890', { name: 'P', objective: 'SEARCH', dailyBudget: 10, currency: 'BRL' })).rejects.toThrow(
      /Google Ads recusou ao criar o orçamento: The required field was not present\. \(código REQUIRED · campo operations\.create\.amount_micros · request-id abc123\)/,
    );
  });
});
