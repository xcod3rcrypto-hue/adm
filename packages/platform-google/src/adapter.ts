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
  type RemoteAdPerformance,
  type RemoteCampaign,
  type RemoteSearchTerm,
  type RemoteInsightRow,
  type RetryOptions,
} from '@advertex/advertising-core';

export const GOOGLE_DEFAULT_API_VERSION = 'v25';
const HOST = 'googleads.googleapis.com';

export interface GoogleAdapterOptions {
  developerToken: string;
  /** Retorna um access token válido (renovando quando necessário). */
  getAccessToken: () => Promise<string>;
  /** login-customer-id padrão (MCC configurada manualmente). */
  loginCustomerId?: string;
  /** login-customer-id específico por conta (descoberto ao listar contas). */
  loginCustomerIdFor?: (customerId: string) => string | null | undefined;
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
    details?: Array<{
      requestId?: string;
      errors?: Array<{ errorCode?: Record<string, string>; message?: string; location?: { fieldPathElements?: Array<{ fieldName?: string; index?: number }> } }>;
    }>;
  };
}

/** Contas de administrador são marcadas com este sufixo no nome ao sincronizar. */
export const MANAGER_SUFFIX = ' (MCC)';
export const isManagerAccountName = (name: string) => name.endsWith(MANAGER_SUFFIX);

const assertNumericCampaign = (id: string) => {
  if (!/^\d{1,20}$/.test(id)) throw new Error('ID de campanha Google Ads inválido.');
};

const assertRange = (range: DateRange) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(range.from) || !/^\d{4}-\d{2}-\d{2}$/.test(range.to)) throw new Error('Período inválido.');
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

  private async headers(customerId?: string, loginOverride?: string): Promise<Record<string, string>> {
    const h: Record<string, string> = {
      Authorization: `Bearer ${await this.opts.getAccessToken()}`,
      'developer-token': this.opts.developerToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const login = loginOverride ?? (customerId ? this.opts.loginCustomerIdFor?.(customerId) : undefined) ?? this.opts.loginCustomerId;
    if (login) h['login-customer-id'] = login;
    return h;
  }

  /** `write`: mutações não são repetidas automaticamente (resultado incerto exige verificação). */
  private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown, write = false, loginOverride?: string): Promise<T> {
    const customerId = /^customers\/(\d{10})[/:]/.exec(path)?.[1];
    const res = await fetchWithRetry(
      this.fetchImpl,
      `https://${HOST}/${this.version}/${path}`,
      { method, headers: await this.headers(customerId, loginOverride), body: body === undefined ? undefined : JSON.stringify(body) },
      write ? { ...this.retry, retries: 0 } : this.retry,
      this.breaker,
    );
    const json = (await res.json().catch(() => ({}))) as T & GoogleErrorBody;
    if (!res.ok || json.error) throw toGoogleError(res.status, json);
    return json;
  }

  /** Executa uma consulta GAQL paginada via googleAds:search. */
  async search<T>(customerId: string, query: string, loginOverride?: string): Promise<T[]> {
    assertCustomerId(customerId);
    const out: T[] = [];
    let pageToken: string | undefined;
    let pages = 0;
    do {
      const page: { results?: T[]; nextPageToken?: string } = await this.request(
        'POST',
        `customers/${customerId}/googleAds:search`,
        { query, ...(pageToken ? { pageToken } : {}) },
        false,
        loginOverride,
      );
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

  /**
   * Lista as contas acessíveis diretamente e, para cada conta de administrador
   * (MCC), as contas de anúncios vinculadas a ela (customer_client). Cada conta
   * guarda o login-customer-id correto: a própria conta quando o acesso é
   * direto, ou a MCC quando o acesso é por meio dela.
   */
  async listAccounts(): Promise<RemoteAccount[]> {
    const ids = await this.listAccessibleCustomerIds();
    const byId = new Map<string, RemoteAccount>();
    for (const id of ids) {
      try {
        const rows = await this.search<{ customer: { id: string; descriptiveName?: string; currencyCode?: string; timeZone?: string; status?: string; manager?: boolean } }>(
          id,
          'SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.status, customer.manager FROM customer LIMIT 1',
          id,
        );
        const c = rows[0]?.customer;
        byId.set(id, {
          remoteId: id,
          name: (c?.descriptiveName || `Cliente ${id}`) + (c?.manager ? MANAGER_SUFFIX : ''),
          currency: c?.currencyCode ?? null,
          timezone: c?.timeZone ?? null,
          status: c?.status ?? null,
          loginCustomerId: id,
        });
        if (c?.manager) {
          const children = await this.search<{ customerClient: { id: string; descriptiveName?: string; currencyCode?: string; timeZone?: string; status?: string; manager?: boolean } }>(
            id,
            'SELECT customer_client.id, customer_client.descriptive_name, customer_client.currency_code, customer_client.time_zone, customer_client.status, customer_client.manager FROM customer_client WHERE customer_client.level = 1',
            id,
          );
          for (const { customerClient: cc } of children) {
            if (!cc?.id || byId.has(cc.id)) continue;
            byId.set(cc.id, {
              remoteId: cc.id,
              name: (cc.descriptiveName || `Cliente ${cc.id}`) + (cc.manager ? MANAGER_SUFFIX : ''),
              currency: cc.currencyCode ?? null,
              timezone: cc.timeZone ?? null,
              status: cc.status ?? null,
              loginCustomerId: id,
            });
          }
        }
      } catch (err) {
        if (!byId.has(id)) byId.set(id, { remoteId: id, name: `Cliente ${id}`, currency: null, timezone: null, status: err instanceof Error ? `ERRO: ${err.message}` : 'ERRO', loginCustomerId: null });
      }
    }
    return [...byId.values()];
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
    assertRange(range);
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

  private async mutate(
    customerId: string,
    resource: 'campaigns' | 'campaignBudgets' | 'assets' | 'adGroups' | 'adGroupCriteria' | 'campaignCriteria' | 'adGroupAds',
    operations: unknown[],
  ): Promise<string[]> {
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
    const [budget] = await withStep('ao criar o orçamento', () => this.mutate(customerId, 'campaignBudgets', [
      {
        create: {
          name: `${spec.name} — orçamento ${new Date().toISOString()}`,
          amountMicros: String(Math.round(spec.dailyBudget * 1_000_000)),
          deliveryMethod: 'STANDARD',
          explicitlyShared: false,
        },
      },
    ]));
    if (!budget) throw new PlatformApiError('google', 200, 'A Google Ads API não retornou o orçamento criado.', false);
    try {
      const [campaign] = await withStep('ao criar a campanha', () => this.mutate(customerId, 'campaigns', [
        {
          create: {
            name: spec.name,
            status: 'PAUSED',
            advertisingChannelType: 'SEARCH',
            campaignBudget: budget,
            manualCpc: {},
            // target_partner_search_network fica de fora: só é aceito em contas parceiras selecionadas.
            networkSettings: { targetGoogleSearch: true, targetSearchNetwork: true, targetContentNetwork: false },
            containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
          },
        },
      ]));
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

  async deleteCampaign(customerId: string, campaignRemoteId: string): Promise<void> {
    assertNumericCampaign(campaignRemoteId);
    await withStep('ao excluir a campanha', () => this.mutate(customerId, 'campaigns', [{ remove: `customers/${customerId}/campaigns/${campaignRemoteId}` }]));
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

  // -------------------------------------------------------------------------
  // Rede de Pesquisa: ideias de palavras-chave, grupos, palavras e anúncios
  // -------------------------------------------------------------------------

  /** Planejador de palavras-chave (KeywordPlanIdeaService). Leitura: pode repetir. */
  async generateKeywordIdeas(
    customerId: string,
    req: { seeds: string[]; url: string; languageId: string; geoTargetId: string; limit?: number },
  ): Promise<Array<{ text: string; avgMonthlySearches: number | null; competition: 'LOW' | 'MEDIUM' | 'HIGH' | null; lowBidMicros: number | null; highBidMicros: number | null }>> {
    assertCustomerId(customerId);
    if (req.seeds.length === 0 && !req.url) throw new Error('Informe palavras-semente ou uma URL.');
    const seed =
      req.seeds.length > 0 && req.url
        ? { keywordAndUrlSeed: { url: req.url, keywords: req.seeds } }
        : req.seeds.length > 0
          ? { keywordSeed: { keywords: req.seeds } }
          : { urlSeed: { url: req.url } };
    const r = await this.request<{
      results?: Array<{ text?: string; keywordIdeaMetrics?: { avgMonthlySearches?: string; competition?: string; lowTopOfPageBidMicros?: string; highTopOfPageBidMicros?: string } }>;
    }>('POST', `customers/${customerId}:generateKeywordIdeas`, {
      language: `languageConstants/${req.languageId}`,
      geoTargetConstants: [`geoTargetConstants/${req.geoTargetId}`],
      keywordPlanNetwork: 'GOOGLE_SEARCH',
      includeAdultKeywords: false,
      pageSize: Math.min(req.limit ?? 50, 200),
      ...seed,
    });
    const num = (v: string | undefined) => (v === undefined || v === '' ? null : Number(v));
    const comp = (v: string | undefined) => (v === 'LOW' || v === 'MEDIUM' || v === 'HIGH' ? v : null);
    return (r.results ?? [])
      .filter((x) => x.text)
      .map((x) => ({
        text: x.text!,
        avgMonthlySearches: num(x.keywordIdeaMetrics?.avgMonthlySearches),
        competition: comp(x.keywordIdeaMetrics?.competition),
        lowBidMicros: num(x.keywordIdeaMetrics?.lowTopOfPageBidMicros),
        highBidMicros: num(x.keywordIdeaMetrics?.highTopOfPageBidMicros),
      }));
  }

  async findAdGroupByName(customerId: string, campaignRemoteId: string, name: string): Promise<string | null> {
    assertNumericCampaign(campaignRemoteId);
    const escaped = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const rows = await this.search<{ adGroup: { id: string; name: string } }>(
      customerId,
      `SELECT ad_group.id, ad_group.name FROM ad_group WHERE campaign.id = ${campaignRemoteId} AND ad_group.name = '${escaped}' AND ad_group.status != 'REMOVED'`,
    );
    return rows.find((r) => r.adGroup.name === name)?.adGroup.id ?? null;
  }

  async createAdGroup(customerId: string, campaignRemoteId: string, spec: { name: string; cpcBid: number | null }): Promise<{ remoteId: string }> {
    assertNumericCampaign(campaignRemoteId);
    const [rn] = await withStep('ao criar o grupo de anúncios', () =>
      this.mutate(customerId, 'adGroups', [
        {
          create: {
            name: spec.name,
            campaign: `customers/${customerId}/campaigns/${campaignRemoteId}`,
            status: 'ENABLED',
            type: 'SEARCH_STANDARD',
            ...(spec.cpcBid ? { cpcBidMicros: String(Math.round(spec.cpcBid * 1_000_000)) } : {}),
          },
        },
      ]),
    );
    const id = rn?.split('/').pop();
    if (!id) throw new PlatformApiError('google', 200, 'A Google Ads API não retornou o grupo de anúncios criado.', false);
    return { remoteId: id };
  }

  async addKeywords(customerId: string, adGroupRemoteId: string, keywords: Array<{ text: string; matchType: 'BROAD' | 'PHRASE' | 'EXACT' }>): Promise<number> {
    assertNumericCampaign(adGroupRemoteId);
    const out = await withStep('ao adicionar palavras-chave', () =>
      this.mutate(
        customerId,
        'adGroupCriteria',
        keywords.map((k) => ({ create: { adGroup: `customers/${customerId}/adGroups/${adGroupRemoteId}`, status: 'ENABLED', keyword: { text: k.text, matchType: k.matchType } } })),
      ),
    );
    return out.length;
  }

  async addNegativeKeywords(customerId: string, campaignRemoteId: string, texts: string[], matchType: 'PHRASE' | 'EXACT' = 'PHRASE'): Promise<number> {
    assertNumericCampaign(campaignRemoteId);
    if (texts.length === 0) return 0;
    const out = await withStep('ao adicionar palavras negativas', () =>
      this.mutate(
        customerId,
        'campaignCriteria',
        texts.map((t) => ({ create: { campaign: `customers/${customerId}/campaigns/${campaignRemoteId}`, negative: true, keyword: { text: t, matchType } } })),
      ),
    );
    return out.length;
  }


  /** Desempenho por anúncio no período (métricas agregadas, sem segmentar por dia). */
  async fetchAdPerformance(customerId: string, range: DateRange, currency = 'USD'): Promise<RemoteAdPerformance[]> {
    assertRange(range);
    const rows = await this.search<{
      campaign: { id: string };
      adGroup: { id: string };
      adGroupAd: {
        status?: string;
        ad: {
          id: string;
          name?: string;
          finalUrls?: string[];
          responsiveSearchAd?: { headlines?: Array<{ text?: string }>; descriptions?: Array<{ text?: string }> };
          expandedTextAd?: { headlinePart1?: string; headlinePart2?: string; description?: string };
          responsiveDisplayAd?: { headlines?: Array<{ text?: string }>; longHeadline?: { text?: string }; descriptions?: Array<{ text?: string }> };
        };
      };
      metrics: { costMicros?: string; impressions?: string; clicks?: string; conversions?: number; conversionsValue?: number };
    }>(
      customerId,
      'SELECT campaign.id, ad_group.id, ad_group_ad.status, ad_group_ad.ad.id, ad_group_ad.ad.name, ad_group_ad.ad.final_urls, ' +
        'ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.ad.responsive_search_ad.descriptions, ' +
        'ad_group_ad.ad.expanded_text_ad.headline_part1, ad_group_ad.ad.expanded_text_ad.headline_part2, ad_group_ad.ad.expanded_text_ad.description, ' +
        'ad_group_ad.ad.responsive_display_ad.headlines, ad_group_ad.ad.responsive_display_ad.long_headline, ad_group_ad.ad.responsive_display_ad.descriptions, ' +
        'metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions, metrics.conversions_value ' +
        `FROM ad_group_ad WHERE segments.date BETWEEN '${range.from}' AND '${range.to}' AND ad_group_ad.status != 'REMOVED' AND metrics.impressions > 0`,
    );
    const texts = (list?: Array<{ text?: string }>) => (list ?? []).map((x) => x.text ?? '').filter(Boolean);
    return rows.map((r) => {
      const ad = r.adGroupAd.ad;
      const rsa = ad.responsiveSearchAd;
      const eta = ad.expandedTextAd;
      const rda = ad.responsiveDisplayAd;
      const headlines = rsa ? texts(rsa.headlines) : eta ? [eta.headlinePart1 ?? '', eta.headlinePart2 ?? ''].filter(Boolean) : rda ? [rda.longHeadline?.text ?? '', ...texts(rda.headlines)].filter(Boolean) : [];
      const descriptions = rsa ? texts(rsa.descriptions) : eta ? [eta.description ?? ''].filter(Boolean) : rda ? texts(rda.descriptions) : [];
      return {
        remoteAdId: ad.id,
        adName: ad.name || headlines[0] || `Anúncio ${ad.id}`,
        remoteCampaignId: r.campaign.id,
        remoteAdGroupId: r.adGroup.id,
        status: r.adGroupAd.status ?? '',
        headline: headlines.slice(0, 3).join(' | '),
        body: descriptions.slice(0, 2).join(' '),
        cta: '',
        imageUrl: null,
        currency,
        spend: Number(r.metrics.costMicros ?? 0) / 1_000_000,
        impressions: Number(r.metrics.impressions ?? 0),
        reach: null,
        clicks: Number(r.metrics.clicks ?? 0),
        conversions: Number(r.metrics.conversions ?? 0),
        revenue: r.metrics.conversionsValue === undefined ? null : Number(r.metrics.conversionsValue),
      };
    });
  }

  /**
   * Orçamentos da conta (faturamento mensal/por orçamento aprovado). Contas
   * pagas no cartão normalmente não têm orçamento: a lista volta vazia.
   */
  async fetchAccountBudgets(customerId: string): Promise<
    Array<{ id: string; name: string; status: string; limit: number | null; served: number; adjustments: number; start: string | null; end: string | null }>
  > {
    const rows = await this.search<{
      accountBudget: {
        id?: string;
        name?: string;
        status?: string;
        approvedSpendingLimitMicros?: string;
        approvedSpendingLimitType?: string;
        amountServedMicros?: string;
        totalAdjustmentsMicros?: string;
        approvedStartDateTime?: string;
        approvedEndDateTime?: string;
      };
    }>(
      customerId,
      'SELECT account_budget.id, account_budget.name, account_budget.status, account_budget.approved_spending_limit_micros, account_budget.approved_spending_limit_type, ' +
        'account_budget.amount_served_micros, account_budget.total_adjustments_micros, account_budget.approved_start_date_time, account_budget.approved_end_date_time ' +
        "FROM account_budget WHERE account_budget.status = 'APPROVED'",
    );
    const m = (v?: string) => (v === undefined ? 0 : Number(v) / 1_000_000);
    return rows.map((r) => {
      const b = r.accountBudget;
      return {
        id: b.id ?? '',
        name: b.name ?? '',
        status: b.status ?? '',
        // INFINITE = sem limite.
        limit: b.approvedSpendingLimitMicros ? m(b.approvedSpendingLimitMicros) : null,
        served: m(b.amountServedMicros),
        adjustments: m(b.totalAdjustmentsMicros),
        start: b.approvedStartDateTime ?? null,
        end: b.approvedEndDateTime ?? null,
      };
    });
  }

  /** Termos de busca reais que acionaram os anúncios (relatório de termos de pesquisa). */
  async fetchSearchTerms(customerId: string, range: DateRange): Promise<RemoteSearchTerm[]> {
    assertRange(range);
    const rows = await this.search<{
      searchTermView: { searchTerm?: string; status?: string };
      campaign: { id: string };
      adGroup: { id: string };
      metrics: { costMicros?: string; impressions?: string; clicks?: string; conversions?: number; conversionsValue?: number };
    }>(
      customerId,
      'SELECT search_term_view.search_term, search_term_view.status, campaign.id, ad_group.id, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions, metrics.conversions_value ' +
        `FROM search_term_view WHERE segments.date BETWEEN '${range.from}' AND '${range.to}' AND metrics.impressions > 0`,
    );
    return rows
      .filter((r) => r.searchTermView.searchTerm)
      .map((r) => ({
        term: r.searchTermView.searchTerm!,
        status: r.searchTermView.status ?? 'NONE',
        remoteCampaignId: r.campaign.id,
        remoteAdGroupId: r.adGroup.id,
        spend: Number(r.metrics.costMicros ?? 0) / 1_000_000,
        impressions: Number(r.metrics.impressions ?? 0),
        clicks: Number(r.metrics.clicks ?? 0),
        conversions: Number(r.metrics.conversions ?? 0),
        revenue: r.metrics.conversionsValue === undefined ? null : Number(r.metrics.conversionsValue),
      }));
  }

  /** Pausa um anúncio (ad_group_ad). Repetir é seguro: o estado final é o mesmo. */
  async pauseAd(customerId: string, adGroupRemoteId: string, adRemoteId: string): Promise<void> {
    assertNumericCampaign(adGroupRemoteId);
    assertNumericCampaign(adRemoteId);
    await withStep('ao pausar o anúncio', () =>
      this.mutate(customerId, 'adGroupAds', [
        { update: { resourceName: `customers/${customerId}/adGroupAds/${adGroupRemoteId}~${adRemoteId}`, status: 'PAUSED' }, updateMask: 'status' },
      ]),
    );
  }

  /** Quantidade de cada termo já negativado na campanha (verificação antes de repetir). */
  async listNegativeKeywords(customerId: string, campaignRemoteId: string): Promise<string[]> {
    assertNumericCampaign(campaignRemoteId);
    const rows = await this.search<{ campaignCriterion: { keyword?: { text?: string } } }>(
      customerId,
      `SELECT campaign_criterion.keyword.text FROM campaign_criterion WHERE campaign.id = ${campaignRemoteId} AND campaign_criterion.negative = TRUE AND campaign_criterion.type = 'KEYWORD'`,
    );
    return rows.map((r) => r.campaignCriterion.keyword?.text ?? '').filter(Boolean);
  }


  /** Quantidade de anúncios ativos/pausados no grupo (verificação antes de repetir a criação). */
  async countAds(customerId: string, adGroupRemoteId: string): Promise<{ count: number; firstId: string | null }> {
    assertNumericCampaign(adGroupRemoteId);
    const rows = await this.search<{ adGroupAd: { ad: { id: string } } }>(
      customerId,
      `SELECT ad_group_ad.ad.id FROM ad_group_ad WHERE ad_group.id = ${adGroupRemoteId} AND ad_group_ad.status != 'REMOVED'`,
    );
    return { count: rows.length, firstId: rows[0]?.adGroupAd.ad.id ?? null };
  }

  async createResponsiveSearchAd(
    customerId: string,
    adGroupRemoteId: string,
    ad: { finalUrl: string; path1: string; path2: string; headlines: string[]; descriptions: string[] },
  ): Promise<{ remoteId: string }> {
    assertNumericCampaign(adGroupRemoteId);
    const [rn] = await withStep('ao criar o anúncio responsivo', () =>
      this.mutate(customerId, 'adGroupAds', [
        {
          create: {
            adGroup: `customers/${customerId}/adGroups/${adGroupRemoteId}`,
            status: 'ENABLED',
            ad: {
              finalUrls: [ad.finalUrl],
              responsiveSearchAd: {
                headlines: ad.headlines.map((text) => ({ text })),
                descriptions: ad.descriptions.map((text) => ({ text })),
                ...(ad.path1 ? { path1: ad.path1 } : {}),
                ...(ad.path2 ? { path2: ad.path2 } : {}),
              },
            },
          },
        },
      ]),
    );
    const id = rn?.split('~').pop();
    if (!id) throw new PlatformApiError('google', 200, 'A Google Ads API não retornou o anúncio criado.', false);
    return { remoteId: id };
  }
}

export function toGoogleError(status: number, body: GoogleErrorBody): PlatformApiError {
  const e = body.error;
  const detail = e?.details?.flatMap((d) => d.errors ?? [])[0];
  const codeKey = detail?.errorCode ? Object.values(detail.errorCode)[0] : e?.status;
  let message = detail?.message ?? e?.message ?? `Erro HTTP ${status} na Google Ads API.`;
  if (codeKey === 'DEVELOPER_TOKEN_NOT_APPROVED' || codeKey === 'DEVELOPER_TOKEN_PROHIBITED')
    message = 'O developer token não tem acesso a contas de produção. Solicite acesso básico/padrão no Centro de API do Google Ads ou use uma conta de teste.';
  else if (/only approved for use with test accounts/i.test(message))
    message =
      'O projeto do Google Cloud ainda só tem acesso a contas de teste. Confira o nível de acesso em Google Cloud → Google Ads API → Níveis de acesso (Exploração ou Básico) no mesmo projeto do Client ID informado; após a liberação, pode levar alguns minutos.';
  else if (codeKey === 'OPERATION_NOT_PERMITTED_FOR_CONTEXT' || codeKey === 'CANNOT_MODIFY_MANAGER_ACCOUNT' || /not allowed for the given context/i.test(message))
    message = 'Operação não permitida nesta conta. Campanhas não podem ser criadas ou alteradas em contas de administrador (MCC): escolha a conta de anúncios vinculada.';
  else if (codeKey === 'USER_PERMISSION_DENIED') message = 'Usuário sem permissão nesta conta. Para contas gerenciadas, informe o login-customer-id da MCC.';
  else if (status === 401) message = 'Credenciais OAuth inválidas ou expiradas. Autorize novamente.';
  else if (status === 429 || codeKey === 'RESOURCE_EXHAUSTED') message = 'Cota da Google Ads API esgotada. Tente novamente mais tarde.';
  const field = detail?.location?.fieldPathElements?.map((f) => f.fieldName).filter(Boolean).join('.');
  const requestId = e?.details?.find((d) => d.requestId)?.requestId;
  const extra = [codeKey && codeKey !== e?.status ? `código ${codeKey}` : null, field ? `campo ${field}` : null, requestId ? `request-id ${requestId}` : null].filter(Boolean);
  if (extra.length) message += ` (${extra.join(' · ')})`;
  return new PlatformApiError('google', status, message, status === 429 || status >= 500, codeKey);
}

/** Prefixa a etapa da operação (ex.: "ao criar a campanha") na mensagem de erro da plataforma. */
async function withStep<T>(step: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof PlatformApiError) throw new PlatformApiError(err.platform, err.status, `Google Ads recusou ${step}: ${err.message}`, err.retryable, err.remoteCode);
    throw err;
  }
}
