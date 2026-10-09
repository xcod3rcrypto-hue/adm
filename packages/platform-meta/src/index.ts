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

export const META_DEFAULT_API_VERSION = 'v26.0';
const GRAPH_HOST = 'graph.facebook.com';

/** Tipos de ação contabilizados como conversão. Documentado em docs/INTEGRATIONS.md. */
export const META_CONVERSION_ACTIONS = ['purchase', 'lead', 'complete_registration'];
export const META_REVENUE_ACTIONS = ['purchase'];

/** Moedas sem casas decimais na Meta (valores de orçamento já em unidades inteiras). */
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'CLP', 'COP', 'CRC', 'HUF', 'ISK', 'IDR', 'PYG', 'TWD', 'VND']);

/** Converte unidades da moeda para a unidade mínima exigida pela Graph API (centavos). */
export function majorToMinor(value: number, currency: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error('Valor de orçamento inválido.');
  return ZERO_DECIMAL.has(currency) ? Math.round(value) : Math.round(value * 100);
}

export function minorToMajor(value: string | number | undefined | null, currency: string | null): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return currency && ZERO_DECIMAL.has(currency) ? n : n / 100;
}

interface GraphError {
  error?: { message?: string; type?: string; code?: number; error_subcode?: number; fbtrace_id?: string };
}

interface Paged<T> {
  data: T[];
  paging?: { next?: string };
}

export interface MetaAdapterOptions {
  accessToken: string;
  apiVersion?: string;
  fetchImpl?: FetchLike;
  retry?: RetryOptions;
  /** Limite de páginas por listagem, evita laços infinitos. */
  maxPages?: number;
}

export class MetaAdsAdapter implements AdPlatformReader, AdPlatformWriter {
  readonly platform = 'meta' as const;
  private readonly version: string;
  private readonly fetchImpl: FetchLike;
  private readonly retry: RetryOptions;
  private readonly breaker = new CircuitBreaker();
  private readonly maxPages: number;

  constructor(private readonly opts: MetaAdapterOptions) {
    if (!/^v\d+\.\d+$/.test(opts.apiVersion ?? META_DEFAULT_API_VERSION)) throw new Error('Versão da Graph API inválida.');
    this.version = opts.apiVersion ?? META_DEFAULT_API_VERSION;
    this.fetchImpl = opts.fetchImpl ?? ((u, i) => fetch(u, i));
    this.retry = opts.retry ?? defaultRetry;
    this.maxPages = opts.maxPages ?? 50;
  }

  private url(path: string, params: Record<string, string>): string {
    const u = new URL(`https://${GRAPH_HOST}/${this.version}/${path.replace(/^\//, '')}`);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    return u.toString();
  }

  private async get<T>(url: string): Promise<T> {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== GRAPH_HOST) throw new Error('URL de paginação fora do domínio da Graph API.');
    // O token vai no cabeçalho, nunca na URL (evita vazamento em logs).
    parsed.searchParams.delete('access_token');
    const res = await fetchWithRetry(
      this.fetchImpl,
      parsed.toString(),
      { method: 'GET', headers: { Authorization: `Bearer ${this.opts.accessToken}`, Accept: 'application/json' } },
      this.retry,
      this.breaker,
    );
    const body = (await res.json().catch(() => ({}))) as T & GraphError;
    if (!res.ok || body.error) throw toApiError(res.status, body);
    return body;
  }

  private async getAll<T>(url: string): Promise<T[]> {
    const out: T[] = [];
    let next: string | undefined = url;
    let pages = 0;
    while (next && pages < this.maxPages) {
      const page: Paged<T> = await this.get<Paged<T>>(next);
      out.push(...page.data);
      next = page.paging?.next;
      pages += 1;
    }
    return out;
  }

  /**
   * POST na Graph API sem retentativas: escritas não são idempotentes e uma
   * repetição automática poderia, por exemplo, criar campanhas duplicadas.
   */
  private async post<T>(path: string, params: Record<string, string>): Promise<T> {
    const res = await fetchWithRetry(
      this.fetchImpl,
      this.url(path, {}),
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.opts.accessToken}`, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params).toString(),
      },
      { ...this.retry, retries: 0 },
      this.breaker,
    );
    const body = (await res.json().catch(() => ({}))) as T & GraphError;
    if (!res.ok || body.error) throw toApiError(res.status, body);
    return body;
  }

  /** Identidade do token: confirma que a credencial funciona. */
  async me(): Promise<{ id: string; name: string }> {
    return this.get<{ id: string; name: string }>(this.url('me', { fields: 'id,name' }));
  }

  async listAccounts(): Promise<RemoteAccount[]> {
    const rows = await this.getAll<{ account_id: string; name: string; currency?: string; timezone_name?: string; account_status?: number }>(
      this.url('me/adaccounts', { fields: 'account_id,name,currency,timezone_name,account_status', limit: '100' }),
    );
    return rows.map((r) => ({
      remoteId: r.account_id,
      name: r.name,
      currency: r.currency ?? null,
      timezone: r.timezone_name ?? null,
      status: r.account_status === undefined ? null : accountStatus(r.account_status),
    }));
  }

  async listCampaigns(accountRemoteId: string, currency: string | null = null): Promise<RemoteCampaign[]> {
    assertNumericId(accountRemoteId);
    const rows = await this.getAll<{
      id: string;
      name: string;
      objective?: string;
      status?: string;
      effective_status?: string;
      daily_budget?: string;
      start_time?: string;
      stop_time?: string;
    }>(this.url(`act_${accountRemoteId}/campaigns`, { fields: 'id,name,objective,status,effective_status,daily_budget,start_time,stop_time', limit: '100' }));
    return rows.map((r) => ({
      remoteId: r.id,
      name: r.name,
      objective: r.objective ?? '',
      status: mapStatus(r.status),
      rawStatus: r.effective_status ?? r.status ?? '',
      dailyBudget: minorToMajor(r.daily_budget, currency),
      startDate: r.start_time ? r.start_time.slice(0, 10) : null,
      endDate: r.stop_time ? r.stop_time.slice(0, 10) : null,
    }));
  }

  async fetchInsights(accountRemoteId: string, range: DateRange): Promise<RemoteInsightRow[]> {
    assertNumericId(accountRemoteId);
    const rows = await this.getAll<{
      campaign_id: string;
      date_start: string;
      account_currency?: string;
      spend?: string;
      impressions?: string;
      reach?: string;
      clicks?: string;
      actions?: Array<{ action_type: string; value: string }>;
      action_values?: Array<{ action_type: string; value: string }>;
    }>(
      this.url(`act_${accountRemoteId}/insights`, {
        level: 'campaign',
        fields: 'campaign_id,date_start,account_currency,spend,impressions,reach,clicks,actions,action_values',
        time_range: JSON.stringify({ since: range.from, until: range.to }),
        time_increment: '1',
        limit: '500',
      }),
    );
    return rows.map((r) => {
      const revenue = sumActions(r.action_values, META_REVENUE_ACTIONS);
      return {
        campaignRemoteId: r.campaign_id,
        date: r.date_start,
        currency: r.account_currency ?? 'USD',
        spend: num(r.spend),
        impressions: num(r.impressions),
        reach: r.reach === undefined ? null : num(r.reach),
        clicks: num(r.clicks),
        conversions: sumActions(r.actions, META_CONVERSION_ACTIONS) ?? 0,
        revenue,
      };
    });
  }

  /** Cria a campanha SEMPRE pausada, com orçamento no nível da campanha (CBO). */
  async createCampaign(accountRemoteId: string, spec: CampaignSpec): Promise<{ remoteId: string }> {
    assertNumericId(accountRemoteId);
    if (!/^OUTCOME_[A-Z_]+$/.test(spec.objective)) throw new Error('Objetivo da Meta inválido (use um objetivo OUTCOME_*).');
    const r = await this.post<{ id?: string }>(`act_${accountRemoteId}/campaigns`, {
      name: spec.name,
      objective: spec.objective,
      status: 'PAUSED',
      special_ad_categories: '[]',
      daily_budget: String(majorToMinor(spec.dailyBudget, spec.currency)),
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    });
    if (!r.id) throw new PlatformApiError('meta', 200, 'A Graph API não retornou o ID da campanha criada.', false);
    return { remoteId: r.id };
  }

  async findCampaignByName(accountRemoteId: string, name: string): Promise<string | null> {
    assertNumericId(accountRemoteId);
    const rows = await this.getAll<{ id: string; name: string }>(
      this.url(`act_${accountRemoteId}/campaigns`, {
        fields: 'id,name',
        filtering: JSON.stringify([{ field: 'name', operator: 'EQUAL', value: name }]),
        limit: '25',
      }),
    );
    return rows.find((r) => r.name === name)?.id ?? null;
  }

  async setCampaignStatus(_accountRemoteId: string, campaignRemoteId: string, status: 'active' | 'paused'): Promise<void> {
    assertNumericId(campaignRemoteId);
    await this.post(campaignRemoteId, { status: status === 'active' ? 'ACTIVE' : 'PAUSED' });
  }

  async updateDailyBudget(_accountRemoteId: string, campaignRemoteId: string, amount: number, currency: string): Promise<void> {
    assertNumericId(campaignRemoteId);
    await this.post(campaignRemoteId, { daily_budget: String(majorToMinor(amount, currency)) });
  }

  async uploadImage(accountRemoteId: string, fileName: string, data: Uint8Array): Promise<{ remoteId: string }> {
    assertNumericId(accountRemoteId);
    const r = await this.post<{ images?: Record<string, { hash?: string }> }>(`act_${accountRemoteId}/adimages`, {
      name: fileName,
      bytes: Buffer.from(data).toString('base64'),
    });
    const hash = Object.values(r.images ?? {})[0]?.hash;
    if (!hash) throw new PlatformApiError('meta', 200, 'A Graph API não retornou o hash da imagem enviada.', false);
    return { remoteId: hash };
  }
}

function num(v: string | undefined): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function sumActions(list: Array<{ action_type: string; value: string }> | undefined, types: string[]): number | null {
  if (!list) return null;
  const matched = list.filter((a) => types.includes(a.action_type));
  if (matched.length === 0) return null;
  return matched.reduce((s, a) => s + num(a.value), 0);
}

function assertNumericId(id: string): void {
  if (!/^\d{1,30}$/.test(id)) throw new Error('ID de conta Meta inválido.');
}

function mapStatus(s: string | undefined): RemoteCampaign['status'] {
  switch (s) {
    case 'ACTIVE':
      return 'active';
    case 'PAUSED':
      return 'paused';
    case 'DELETED':
    case 'ARCHIVED':
      return 'removed';
    default:
      return 'unknown';
  }
}

function accountStatus(code: number): string {
  const map: Record<number, string> = { 1: 'ACTIVE', 2: 'DISABLED', 3: 'UNSETTLED', 7: 'PENDING_RISK_REVIEW', 8: 'PENDING_SETTLEMENT', 9: 'IN_GRACE_PERIOD', 100: 'PENDING_CLOSURE', 101: 'CLOSED' };
  return map[code] ?? `STATUS_${code}`;
}

export function toApiError(status: number, body: GraphError): PlatformApiError {
  const e = body.error;
  const code = e?.code;
  let message = e?.message ?? `Erro HTTP ${status} na Graph API.`;
  if (code === 190) message = 'Token de acesso inválido ou expirado. Gere um novo token e salve novamente.';
  else if (code === 10 || code === 200 || (code !== undefined && code >= 200 && code < 300))
    message = `Permissão insuficiente (${e?.message ?? 'verifique ads_read'}). Confirme as permissões ads_read/ads_management do aplicativo.`;
  else if (code === 4 || code === 17 || code === 32 || code === 613 || code === 80004)
    message = 'Limite de requisições da Meta atingido. Aguarde alguns minutos e tente novamente.';
  const retryable = status === 429 || status >= 500 || code === 4 || code === 17 || code === 32 || code === 613;
  return new PlatformApiError('meta', status, message, retryable, code);
}
