import {
  CircuitBreaker,
  PlatformApiError,
  defaultRetry,
  fetchWithRetry,
  type AdPlatformReader,
  type AdPlatformWriter,
  type CampaignSpec,
  type DateRange,
  type FetchLike,
  type RemoteAccount,
  type RemoteCampaign,
  type RemoteInsightRow,
  type RetryOptions,
} from '@advertex/advertising-core';

export const GOOGLE_DEFAULT_API_VERSION = 'v25';
const HOST = 'googleads.googleapis.com';

export interface GoogleAdapterOptions {
  developerToken: string;
  /** Retorna um access token válido (renovando quando necessário). */
  getAccessToken: () => Promise<string>;
  loginCustomerId?: string;
  apiVersion?: string;
  fetchImpl?: FetchLike;
  retry?: RetryOptions;
  maxPages?: number;
}

interface GoogleErrorBody {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: Array<{ errors?: Array<{ errorCode?: Record<string, string>; message?: string }> }>;
  };
}

const assertNumericCampaign = (id: string) => {
  if (!/^\d{1,20}$/.test(id)) throw new Error('ID de campanha Google Ads inválido.');
};

const assertCustomerId = (id: string) => {
  if (!/^\d{10}$/.test(id)) throw new Error('ID de cliente Google Ads inválido (10 dígitos).');
};

export class GoogleAdsAdapter implements AdPlatformReader, AdPlatformWriter {
  readonly platform = 'google' as const;
  private readonly version: string;
  private readonly fetchImpl: FetchLike;
  private readonly retry: RetryOptions;
  private readonly breaker = new CircuitBreaker();

  constructor(private readonly opts: GoogleAdapterOptions) {
    this.version = opts.apiVersion ?? GOOGLE_DEFAULT_API_VERSION;
    if (!/^v\d+$/.test(this.version)) throw new Error('Versão da Google Ads API inválida.');
    this.fetchImpl = opts.fetchImpl ?? ((u, i) => fetch(u, i));
    this.retry = opts.retry ?? defaultRetry;
  }

  private async headers(): Promise<Record<string, string>> {
    const h: Record<string, string> = {
      Authorization: `Bearer ${await this.opts.getAccessToken()}`,
      'developer-token': this.opts.developerToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.opts.loginCustomerId) h['login-customer-id'] = this.opts.loginCustomerId;
    return h;
  }

  /** `write`: mutações não são repetidas automaticamente (resultado incerto exige verificação). */
  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown, write = false): Promise<T> {
    const res = await fetchWithRetry(
      this.fetchImpl,
      `https://${HOST}/${this.version}/${path}`,
      { method, headers: await this.headers(), body: body === undefined ? undefined : JSON.stringify(body) },
      write ? { ...this.retry, retries: 0 } : this.retry,
      this.breaker,
    );
    const json = (await res.json().catch(() => ({}))) as T & GoogleErrorBody;
    if (!res.ok || json.error) throw toGoogleError(res.status, json);
    return json;
  }

  /** Executa uma consulta GAQL paginada via googleAds:search. */
  async search<T>(customerId: string, query: string): Promise<T[]> {
    assertCustomerId(customerId);
    const out: T[] = [];
    let pageToken: string | undefined;
    let pages = 0;
    do {
      const page: { results?: T[]; nextPageToken?: string } = await this.request('POST', `customers/${customerId}/googleAds:search`, {
        query,
        ...(pageToken ? { pageToken } : {}),
      });
      out.push(...(page.results ?? []));
      pageToken = page.nextPageToken;
      pages += 1;
    } while (pageToken && pages < (this.opts.maxPages ?? 50));
    return out;
  }

  async listAccessibleCustomerIds(): Promise<string[]> {
    const r = await this.request<{ resourceNames?: string[] }>('GET', 'customers:listAccessibleCustomers');
    return (r.resourceNames ?? []).map((n) => n.replace(/^customers\//, ''));
  }

  async listAccounts(): Promise<RemoteAccount[]> {
    const ids = await this.listAccessibleCustomerIds();
    const accounts: RemoteAccount[] = [];
    for (const id of ids) {
      try {
        const rows = await this.search<{ customer: { id: string; descriptiveName?: string; currencyCode?: string; timeZone?: string; status?: string; manager?: boolean } }>(
          id,
          'SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.status, customer.manager FROM customer LIMIT 1',
        );
        const c = rows[0]?.customer;
        accounts.push({
          remoteId: id,
          name: (c?.descriptiveName || `Cliente ${id}`) + (c?.manager ? ' (MCC)' : ''),
          currency: c?.currencyCode ?? null,
          timezone: c?.timeZone ?? null,
          status: c?.status ?? null,
        });
      } catch (err) {
        // Conta acessível mas sem permissão de leitura (ex.: requer login-customer-id).
        accounts.push({ remoteId: id, name: `Cliente ${id}`, currency: null, timezone: null, status: err instanceof Error ? `ERRO: ${err.message}` : 'ERRO' });
      }
    }
    return accounts;
  }

  async listCampaigns(customerId: string): Promise<RemoteCampaign[]> {
    const rows = await this.search<{
      campaign: { id: string; name: string; status?: string; advertisingChannelType?: string };
      campaignBudget?: { amountMicros?: string };
    }>(
      customerId,
      "SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign_budget.amount_micros FROM campaign WHERE campaign.status != 'REMOVED'",
    );
    return rows.map((r) => ({
      remoteId: r.campaign.id,
      name: r.campaign.name,
      objective: r.campaign.advertisingChannelType ?? '',
      status: r.campaign.status === 'ENABLED' ? 'active' : r.campaign.status === 'PAUSED' ? 'paused' : r.campaign.status === 'REMOVED' ? 'removed' : 'unknown',
      rawStatus: r.campaign.status ?? '',
      dailyBudget: r.campaignBudget?.amountMicros ? Number(r.campaignBudget.amountMicros) / 1_000_000 : null,
      startDate: null,
      endDate: null,
    }));
  }

  async fetchInsights(customerId: string, range: DateRange, currency = 'USD'): Promise<RemoteInsightRow[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(range.from) || !/^\d{4}-\d{2}-\d{2}$/.test(range.to)) throw new Error('Período inválido.');
    const rows = await this.search<{
      campaign: { id: string };
      segments: { date: string };
      metrics: { costMicros?: string; impressions?: string; clicks?: string; conversions?: number; conversionsValue?: number };
    }>(
      customerId,
      `SELECT campaign.id, segments.date, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions, metrics.conversions_value FROM campaign WHERE segments.date BETWEEN '${range.from}' AND '${range.to}'`,
    );
    return rows.map((r) => ({
      campaignRemoteId: r.campaign.id,
      date: r.segments.date,
      currency,
      spend: Number(r.metrics.costMicros ?? 0) / 1_000_000,
      impressions: Number(r.metrics.impressions ?? 0),
      reach: null,
      clicks: Number(r.metrics.clicks ?? 0),
      conversions: Number(r.metrics.conversions ?? 0),
      revenue: r.metrics.conversionsValue === undefined ? null : Number(r.metrics.conversionsValue),
    }));
  }

  private async mutate(customerId: string, resource: 'campaigns' | 'campaignBudgets' | 'assets', operations: unknown[]): Promise<string[]> {
    assertCustomerId(customerId);
    const r = await this.request<{ results?: Array<{ resourceName?: string }> }>('POST', `customers/${customerId}/${resource}:mutate`, { operations }, true);
    return (r.results ?? []).map((x) => x.resourceName ?? '');
  }

  /**
   * Cria orçamento + campanha de Pesquisa, SEMPRE pausada. Outros tipos
   * (Performance Max, Display, Vídeo) exigem ativos e configurações que esta
   * versão não cria: são recusados com mensagem explícita.
   */
  async createCampaign(customerId: string, spec: CampaignSpec): Promise<{ remoteId: string }> {
    assertCustomerId(customerId);
    if (spec.objective !== 'SEARCH') {
      throw new PlatformApiError('google', 400, 'Nesta versão, a criação pelo app suporta apenas campanhas de Pesquisa (SEARCH). Crie outros tipos no Google Ads e sincronize.', false);
    }
    if (!Number.isFinite(spec.dailyBudget) || spec.dailyBudget <= 0) throw new Error('Valor de orçamento inválido.');
    const [budget] = await this.mutate(customerId, 'campaignBudgets', [
      {
        create: {
          name: `${spec.name} — orçamento ${new Date().toISOString()}`,
          amountMicros: String(Math.round(spec.dailyBudget * 1_000_000)),
          deliveryMethod: 'STANDARD',
          explicitlyShared: false,
        },
      },
    ]);
    if (!budget) throw new PlatformApiError('google', 200, 'A Google Ads API não retornou o orçamento criado.', false);
    try {
      const [campaign] = await this.mutate(customerId, 'campaigns', [
        {
          create: {
            name: spec.name,
            status: 'PAUSED',
            advertisingChannelType: 'SEARCH',
            campaignBudget: budget,
            manualCpc: {},
            networkSettings: { targetGoogleSearch: true, targetSearchNetwork: true, targetContentNetwork: false, targetPartnerSearchNetwork: false },
            containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
          },
        },
      ]);
      const id = campaign?.split('/').pop();
      if (!id) throw new PlatformApiError('google', 200, 'A Google Ads API não retornou a campanha criada.', false);
      return { remoteId: id };
    } catch (err) {
      // Melhor esforço: não deixar um orçamento órfão na conta.
      await this.mutate(customerId, 'campaignBudgets', [{ remove: budget }]).catch(() => undefined);
      throw err;
    }
  }

  async findCampaignByName(customerId: string, name: string): Promise<string | null> {
    const escaped = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const rows = await this.search<{ campaign: { id: string; name: string } }>(
      customerId,
      `SELECT campaign.id, campaign.name FROM campaign WHERE campaign.name = '${escaped}' AND campaign.status != 'REMOVED'`,
    );
    return rows.find((r) => r.campaign.name === name)?.campaign.id ?? null;
  }

  async setCampaignStatus(customerId: string, campaignRemoteId: string, status: 'active' | 'paused'): Promise<void> {
    assertNumericCampaign(campaignRemoteId);
    await this.mutate(customerId, 'campaigns', [
      { update: { resourceName: `customers/${customerId}/campaigns/${campaignRemoteId}`, status: status === 'active' ? 'ENABLED' : 'PAUSED' }, updateMask: 'status' },
    ]);
  }

  async updateDailyBudget(customerId: string, campaignRemoteId: string, amount: number): Promise<void> {
    assertNumericCampaign(campaignRemoteId);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Valor de orçamento inválido.');
    const rows = await this.search<{ campaign: { campaignBudget?: string } }>(customerId, `SELECT campaign.campaign_budget FROM campaign WHERE campaign.id = ${campaignRemoteId}`);
    const budget = rows[0]?.campaign.campaignBudget;
    if (!budget) throw new PlatformApiError('google', 404, 'Orçamento da campanha não encontrado na conta.', false);
    await this.mutate(customerId, 'campaignBudgets', [{ update: { resourceName: budget, amountMicros: String(Math.round(amount * 1_000_000)) }, updateMask: 'amount_micros' }]);
  }

  async uploadImage(customerId: string, fileName: string, data: Uint8Array): Promise<{ remoteId: string }> {
    const [rn] = await this.mutate(customerId, 'assets', [{ create: { name: fileName.slice(0, 120), type: 'IMAGE', imageAsset: { data: Buffer.from(data).toString('base64') } } }]);
    if (!rn) throw new PlatformApiError('google', 200, 'A Google Ads API não retornou o ativo criado.', false);
    return { remoteId: rn };
  }
}

export function toGoogleError(status: number, body: GoogleErrorBody): PlatformApiError {
  const e = body.error;
  const detail = e?.details?.flatMap((d) => d.errors ?? [])[0];
  const codeKey = detail?.errorCode ? Object.values(detail.errorCode)[0] : e?.status;
  let message = detail?.message ?? e?.message ?? `Erro HTTP ${status} na Google Ads API.`;
  if (codeKey === 'DEVELOPER_TOKEN_NOT_APPROVED' || codeKey === 'DEVELOPER_TOKEN_PROHIBITED')
    message = 'O developer token não tem acesso a contas de produção. Solicite acesso básico/padrão no Centro de API do Google Ads ou use uma conta de teste.';
  else if (codeKey === 'USER_PERMISSION_DENIED') message = 'Usuário sem permissão nesta conta. Para contas gerenciadas, informe o login-customer-id da MCC.';
  else if (status === 401) message = 'Credenciais OAuth inválidas ou expiradas. Autorize novamente.';
  else if (status === 429 || codeKey === 'RESOURCE_EXHAUSTED') message = 'Cota da Google Ads API esgotada. Tente novamente mais tarde.';
  return new PlatformApiError('google', status, message, status === 429 || status >= 500, codeKey);
}
