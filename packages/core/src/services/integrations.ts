import { AppError, type AdvertisingAccount, type IntegrationView, type Platform, type SyncResult } from '@advertex/shared';
import type { AdPlatformWriter, DateRange, RemoteAccount, RemoteCampaign, RemoteInsightRow } from '@advertex/advertising-core';
import { MetaAdsAdapter, META_DEFAULT_API_VERSION, META_CONVERSION_ACTIONS } from '@advertex/platform-meta';
import { GoogleAdsAdapter, GOOGLE_DEFAULT_API_VERSION, isManagerAccountName, refreshAccessToken, revokeToken, runLoopbackAuthorization } from '@advertex/platform-google';
import type { AppContext } from '../context';
import { parseJson, requireOrg } from '../util';
import { recordAudit } from './audit';
import { deleteSecret, getSecret, hasSecret, putSecret, scopes } from './secrets';

interface ConnRow {
  id: string;
  organization_id: string;
  platform: Platform;
  state: IntegrationView['state'];
  api_version: string;
  config: string;
  identity: string | null;
  last_checked_at: string | null;
  last_error: string | null;
}

interface GoogleConfig {
  clientId?: string;
  loginCustomerId?: string;
}

const DEFAULT_VERSION: Record<Platform, string> = { meta: META_DEFAULT_API_VERSION, google: GOOGLE_DEFAULT_API_VERSION };

const SECRET_FIELDS: Record<Platform, string[]> = {
  meta: ['accessToken'],
  google: ['clientSecret', 'developerToken', 'refreshToken'],
};

function getConn(ctx: AppContext, organizationId: string, platform: Platform): ConnRow | undefined {
  return ctx.db.get<ConnRow>('SELECT * FROM integration_connections WHERE organization_id = ? AND platform = ?', [organizationId, platform]);
}

function ensureConn(ctx: AppContext, organizationId: string, platform: Platform, apiVersion?: string): ConnRow {
  const existing = getConn(ctx, organizationId, platform);
  const now = ctx.now();
  if (existing) {
    if (apiVersion && apiVersion !== existing.api_version) {
      ctx.db.run('UPDATE integration_connections SET api_version = ?, updated_at = ? WHERE id = ?', [apiVersion, now, existing.id]);
    }
    return getConn(ctx, organizationId, platform)!;
  }
  ctx.db.run(
    "INSERT INTO integration_connections (id, organization_id, platform, state, api_version, config, created_at, updated_at) VALUES (?, ?, ?, 'not_configured', ?, '{}', ?, ?)",
    [ctx.newId(), organizationId, platform, apiVersion ?? DEFAULT_VERSION[platform], now, now],
  );
  return getConn(ctx, organizationId, platform)!;
}

function setState(ctx: AppContext, connId: string, state: IntegrationView['state'], extra: { identity?: string | null; error?: string | null } = {}): void {
  ctx.db.run('UPDATE integration_connections SET state = ?, identity = COALESCE(?, identity), last_error = ?, last_checked_at = ?, updated_at = ? WHERE id = ?', [
    state,
    extra.identity ?? null,
    extra.error ?? null,
    ctx.now(),
    ctx.now(),
    connId,
  ]);
}

function accounts(ctx: AppContext, organizationId: string, platform: Platform): AdvertisingAccount[] {
  return ctx.db
    .all<{ id: string; platform: Platform; remote_id: string; name: string; currency: string | null; timezone: string | null; status: string | null; last_synced_at: string | null }>(
      'SELECT * FROM advertising_accounts WHERE organization_id = ? AND platform = ? ORDER BY name COLLATE NOCASE',
      [organizationId, platform],
    )
    .map((r) => ({ id: r.id, platform: r.platform, remoteId: r.remote_id, name: r.name, currency: r.currency, timezone: r.timezone, status: r.status, lastSyncedAt: r.last_synced_at }));
}

function view(ctx: AppContext, organizationId: string, platform: Platform): IntegrationView {
  const c = getConn(ctx, organizationId, platform);
  const configured = SECRET_FIELDS[platform].filter((f) => hasSecret(ctx, scopes.org(organizationId, platform, f)));
  if (platform === 'google' && c) {
    const cfg = parseJson<GoogleConfig>(c.config, {});
    if (cfg.clientId) configured.push('clientId');
    if (cfg.loginCustomerId) configured.push('loginCustomerId');
  }
  return {
    platform,
    state: c?.state ?? 'not_configured',
    apiVersion: c?.api_version ?? DEFAULT_VERSION[platform],
    configuredFields: configured,
    lastCheckedAt: c?.last_checked_at ?? null,
    lastError: c?.last_error ?? null,
    identity: c?.identity ?? null,
    accounts: accounts(ctx, organizationId, platform),
  };
}

export function listIntegrations(ctx: AppContext, organizationId: string): IntegrationView[] {
  requireOrg(ctx, organizationId);
  return [view(ctx, organizationId, 'meta'), view(ctx, organizationId, 'google')];
}

export function assertNotDemo(ctx: AppContext, organizationId: string): void {
  if (requireOrg(ctx, organizationId).is_demo) {
    throw new AppError('FORBIDDEN', 'A organização de demonstração não pode ser conectada a contas reais. Crie ou selecione uma organização real.');
  }
}

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function saveMeta(ctx: AppContext, organizationId: string, input: { accessToken?: string; apiVersion: string }): IntegrationView {
  assertNotDemo(ctx, organizationId);
  const conn = ensureConn(ctx, organizationId, 'meta', input.apiVersion);
  if (input.accessToken) {
    putSecret(ctx, scopes.org(organizationId, 'meta', 'accessToken'), organizationId, input.accessToken);
    setState(ctx, conn.id, 'configured');
  }
  recordAudit(ctx, { organizationId, action: 'integration.meta.save', entityType: 'integration', entityId: conn.id, details: { apiVersion: input.apiVersion, tokenUpdated: !!input.accessToken } });
  return view(ctx, organizationId, 'meta');
}

function metaAdapter(ctx: AppContext, organizationId: string): { adapter: MetaAdsAdapter; conn: ConnRow } {
  const conn = getConn(ctx, organizationId, 'meta');
  const token = getSecret(ctx, scopes.org(organizationId, 'meta', 'accessToken'));
  if (!conn || !token) throw new AppError('NOT_CONFIGURED', 'Informe um token de acesso da Meta em Integrações → Meta Ads.');
  return { adapter: new MetaAdsAdapter({ accessToken: token, apiVersion: conn.api_version, fetchImpl: ctx.fetch }), conn };
}

export async function testMeta(ctx: AppContext, organizationId: string): Promise<IntegrationView> {
  assertNotDemo(ctx, organizationId);
  const { adapter, conn } = metaAdapter(ctx, organizationId);
  try {
    const me = await adapter.me();
    setState(ctx, conn.id, 'connected', { identity: `${me.name} (${me.id})` });
    recordAudit(ctx, { organizationId, action: 'integration.meta.test', entityType: 'integration', entityId: conn.id });
  } catch (err) {
    setState(ctx, conn.id, 'error', { error: errMsg(err) });
    recordAudit(ctx, { organizationId, action: 'integration.meta.test', entityType: 'integration', entityId: conn.id, outcome: 'failure', details: { error: errMsg(err) } });
    throw err;
  }
  return view(ctx, organizationId, 'meta');
}

// ---------------------------------------------------------------------------
// Google
// ---------------------------------------------------------------------------

export function saveGoogle(
  ctx: AppContext,
  organizationId: string,
  input: { clientId?: string; clientSecret?: string; developerToken?: string; loginCustomerId: string; apiVersion: string },
): IntegrationView {
  assertNotDemo(ctx, organizationId);
  const conn = ensureConn(ctx, organizationId, 'google', input.apiVersion);
  const cfg = parseJson<GoogleConfig>(conn.config, {});
  if (input.clientId) cfg.clientId = input.clientId;
  cfg.loginCustomerId = input.loginCustomerId || undefined;
  ctx.db.run('UPDATE integration_connections SET config = ?, updated_at = ? WHERE id = ?', [JSON.stringify(cfg), ctx.now(), conn.id]);
  if (input.clientSecret) putSecret(ctx, scopes.org(organizationId, 'google', 'clientSecret'), organizationId, input.clientSecret);
  if (input.developerToken) putSecret(ctx, scopes.org(organizationId, 'google', 'developerToken'), organizationId, input.developerToken);
  if (conn.state === 'not_configured' && cfg.clientId) setState(ctx, conn.id, 'configured');
  recordAudit(ctx, {
    organizationId,
    action: 'integration.google.save',
    entityType: 'integration',
    entityId: conn.id,
    details: { apiVersion: input.apiVersion, clientSecretUpdated: !!input.clientSecret, developerTokenUpdated: !!input.developerToken },
  });
  return view(ctx, organizationId, 'google');
}

function googleCreds(ctx: AppContext, organizationId: string) {
  const conn = getConn(ctx, organizationId, 'google');
  const cfg = parseJson<GoogleConfig>(conn?.config, {});
  const clientSecret = getSecret(ctx, scopes.org(organizationId, 'google', 'clientSecret'));
  if (!conn || !cfg.clientId || !clientSecret) {
    throw new AppError('NOT_CONFIGURED', 'Informe o Client ID e o Client Secret do OAuth (tipo "App para computador") em Integrações → Google Ads.');
  }
  return { conn, cfg, clientId: cfg.clientId, clientSecret };
}

/** Cache de access tokens somente em memória (expiram em ~1h). */
const accessTokenCache = new Map<string, { token: string; expiresAt: number }>();

export async function authorizeGoogle(ctx: AppContext, organizationId: string): Promise<IntegrationView> {
  assertNotDemo(ctx, organizationId);
  const { conn, clientId, clientSecret } = googleCreds(ctx, organizationId);
  try {
    const tokens = await runLoopbackAuthorization({ clientId, clientSecret, openBrowser: ctx.openExternal, fetchImpl: ctx.fetch });
    if (!tokens.refreshToken) throw new Error('O Google não retornou refresh token. Revogue o acesso do app na sua Conta Google e autorize novamente.');
    putSecret(ctx, scopes.org(organizationId, 'google', 'refreshToken'), organizationId, tokens.refreshToken);
    accessTokenCache.set(organizationId, { token: tokens.accessToken, expiresAt: tokens.expiresAt });
    setState(ctx, conn.id, 'configured', { error: null });
    recordAudit(ctx, { organizationId, action: 'integration.google.authorize', entityType: 'integration', entityId: conn.id });
  } catch (err) {
    setState(ctx, conn.id, 'error', { error: errMsg(err) });
    recordAudit(ctx, { organizationId, action: 'integration.google.authorize', entityType: 'integration', entityId: conn.id, outcome: 'failure', details: { error: errMsg(err) } });
    throw new AppError('EXTERNAL_API', errMsg(err), { cause: err });
  }
  return view(ctx, organizationId, 'google');
}

function googleAdapter(ctx: AppContext, organizationId: string): { adapter: GoogleAdsAdapter; conn: ConnRow } {
  const { conn, cfg, clientId, clientSecret } = googleCreds(ctx, organizationId);
  const developerToken = getSecret(ctx, scopes.org(organizationId, 'google', 'developerToken'));
  const refreshToken = getSecret(ctx, scopes.org(organizationId, 'google', 'refreshToken'));
  if (!developerToken) throw new AppError('NOT_CONFIGURED', 'Informe o developer token do Google Ads (Centro de API da conta de administrador).');
  if (!refreshToken) throw new AppError('NOT_CONFIGURED', 'Autorize o acesso à sua Conta Google antes de sincronizar.');
  const getAccessToken = async () => {
    const cached = accessTokenCache.get(organizationId);
    if (cached && cached.expiresAt - 60_000 > Date.now()) return cached.token;
    const t = await refreshAccessToken(ctx.fetch, { refreshToken, clientId, clientSecret });
    accessTokenCache.set(organizationId, { token: t.accessToken, expiresAt: t.expiresAt });
    return t.accessToken;
  };
  return {
    conn,
    adapter: new GoogleAdsAdapter({
      developerToken,
      getAccessToken,
      loginCustomerId: cfg.loginCustomerId,
      // Caminho de acesso descoberto ao listar contas (acesso direto ou via MCC).
      loginCustomerIdFor: (customerId) =>
        ctx.db.get<{ login_customer_id: string | null }>(
          "SELECT login_customer_id FROM advertising_accounts WHERE organization_id = ? AND platform = 'google' AND remote_id = ?",
          [organizationId, customerId],
        )?.login_customer_id,
      apiVersion: conn.api_version,
      fetchImpl: ctx.fetch,
    }),
  };
}

// ---------------------------------------------------------------------------
// Sincronização (comum às plataformas)
// ---------------------------------------------------------------------------

type Reader = { platform: 'meta'; adapter: MetaAdsAdapter; conn: ConnRow } | { platform: 'google'; adapter: GoogleAdsAdapter; conn: ConnRow };

function readerFor(ctx: AppContext, organizationId: string, platform: Platform): Reader {
  return platform === 'meta' ? { platform, ...metaAdapter(ctx, organizationId) } : { platform, ...googleAdapter(ctx, organizationId) };
}

/** Cliente de escrita da plataforma (mesmos adaptadores, credenciais da organização). */
export function platformWriter(ctx: AppContext, organizationId: string, platform: Platform): AdPlatformWriter {
  assertNotDemo(ctx, organizationId);
  return readerFor(ctx, organizationId, platform).adapter;
}

function listRemoteCampaigns(r: Reader, remoteId: string, currency: string | null): Promise<RemoteCampaign[]> {
  return r.platform === 'meta' ? r.adapter.listCampaigns(remoteId, currency) : r.adapter.listCampaigns(remoteId);
}

function fetchRemoteInsights(r: Reader, remoteId: string, range: DateRange, currency: string | null): Promise<RemoteInsightRow[]> {
  return r.platform === 'meta' ? r.adapter.fetchInsights(remoteId, range) : r.adapter.fetchInsights(remoteId, range, currency ?? 'USD');
}

function upsertAccounts(ctx: AppContext, organizationId: string, platform: Platform, connId: string, list: RemoteAccount[]): void {
  const now = ctx.now();
  ctx.db.transaction(() => {
    for (const a of list) {
      ctx.db.run(
        `INSERT INTO advertising_accounts (id, organization_id, connection_id, platform, remote_id, name, currency, timezone, status, login_customer_id, last_synced_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(organization_id, platform, remote_id) DO UPDATE SET name = excluded.name, currency = excluded.currency, timezone = excluded.timezone,
           status = excluded.status, login_customer_id = excluded.login_customer_id, last_synced_at = excluded.last_synced_at, updated_at = excluded.updated_at,
           connection_id = excluded.connection_id`,
        [ctx.newId(), organizationId, connId, platform, a.remoteId, a.name, a.currency, a.timezone, a.status, a.loginCustomerId ?? null, now, now, now],
      );
    }
  });
}

export async function syncAccounts(ctx: AppContext, organizationId: string, platform: Platform): Promise<AdvertisingAccount[]> {
  assertNotDemo(ctx, organizationId);
  const reader = readerFor(ctx, organizationId, platform);
  const conn = reader.conn;
  try {
    const list = await reader.adapter.listAccounts();
    upsertAccounts(ctx, organizationId, platform, conn.id, list);
    setState(ctx, conn.id, 'connected', { error: null });
    recordAudit(ctx, { organizationId, action: `integration.${platform}.syncAccounts`, entityType: 'integration', entityId: conn.id, details: { count: list.length } });
  } catch (err) {
    setState(ctx, conn.id, 'error', { error: errMsg(err) });
    recordAudit(ctx, { organizationId, action: `integration.${platform}.syncAccounts`, entityType: 'integration', entityId: conn.id, outcome: 'failure', details: { error: errMsg(err) } });
    throw err;
  }
  return accounts(ctx, organizationId, platform);
}

function getAccount(ctx: AppContext, organizationId: string, platform: Platform, accountId: string) {
  const a = ctx.db.get<{ id: string; remote_id: string; currency: string | null }>(
    'SELECT id, remote_id, currency FROM advertising_accounts WHERE id = ? AND organization_id = ? AND platform = ?',
    [accountId, organizationId, platform],
  );
  if (!a) throw new AppError('NOT_FOUND', 'Conta de anúncios não encontrada. Sincronize as contas primeiro.');
  return a;
}

/** Importa campanhas (somente leitura). Idempotente por (organização, plataforma, ID remoto). */
export async function syncCampaigns(ctx: AppContext, organizationId: string, platform: Platform, accountId: string): Promise<SyncResult> {
  assertNotDemo(ctx, organizationId);
  const account = getAccount(ctx, organizationId, platform, accountId);
  const reader = readerFor(ctx, organizationId, platform);
  const conn = reader.conn;
  let imported = 0;
  let updated = 0;
  try {
    const list = await listRemoteCampaigns(reader, account.remote_id, account.currency);
    const now = ctx.now();
    ctx.db.transaction(() => {
      for (const c of list) {
        const existing = ctx.db.get<{ id: string }>('SELECT id FROM campaigns WHERE organization_id = ? AND platform = ? AND remote_id = ?', [organizationId, platform, c.remoteId]);
        if (existing) {
          ctx.db.run(
            `UPDATE campaigns SET name = ?, objective = ?, status = ?, daily_budget = ?, currency = ?, start_date = ?, end_date = ?, advertising_account_id = ?,
               sync_state = 'synced', last_synced_at = ?, last_error = NULL, updated_at = ? WHERE id = ?`,
            [c.name, c.objective, c.status, c.dailyBudget, account.currency ?? 'USD', c.startDate, c.endDate, account.id, now, now, existing.id],
          );
          updated += 1;
        } else {
          ctx.db.run(
            `INSERT INTO campaigns (id, organization_id, advertising_account_id, platform, remote_id, name, objective, status, daily_budget, currency, start_date, end_date, sync_state, last_synced_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?, ?)`,
            [ctx.newId(), organizationId, account.id, platform, c.remoteId, c.name, c.objective, c.status, c.dailyBudget, account.currency ?? 'USD', c.startDate, c.endDate, now, now, now],
          );
          imported += 1;
        }
      }
      ctx.db.run('UPDATE advertising_accounts SET last_synced_at = ? WHERE id = ?', [now, account.id]);
    });
    setState(ctx, conn.id, 'connected', { error: null });
    recordAudit(ctx, { organizationId, action: `integration.${platform}.syncCampaigns`, entityType: 'advertising_account', entityId: account.id, details: { imported, updated } });
  } catch (err) {
    recordAudit(ctx, { organizationId, action: `integration.${platform}.syncCampaigns`, entityType: 'advertising_account', entityId: account.id, outcome: 'failure', details: { error: errMsg(err) } });
    throw err;
  }
  const hint =
    imported + updated === 0 && platform === 'google'
      ? isManagerAccountName(ctx.db.get<{ name: string }>('SELECT name FROM advertising_accounts WHERE id = ?', [account.id])?.name ?? '')
        ? ' Esta é uma conta de administrador (MCC): as campanhas ficam nas contas de anúncios vinculadas a ela.'
        : ' A conta não tem campanhas (exceto removidas).'
      : '';
  return { imported, updated, message: `${imported} campanha(s) importada(s), ${updated} atualizada(s).${hint}` };
}

const DEFINITIONS: Record<Platform, string> = {
  meta: `Meta Insights (nível campanha, diário). Conversões = ações ${META_CONVERSION_ACTIONS.join(', ')}; receita = action_values purchase. Janela de atribuição padrão da conta.`,
  google: 'Google Ads (campaign, segments.date). Conversões = metrics.conversions; receita = metrics.conversions_value; custo = cost_micros/1e6.',
};

/** Importa métricas diárias por campanha. Reprocessar o mesmo período substitui os valores (upsert). */
export async function syncInsights(ctx: AppContext, organizationId: string, platform: Platform, accountId: string, range: DateRange): Promise<SyncResult> {
  assertNotDemo(ctx, organizationId);
  if (range.to < range.from) throw new AppError('VALIDATION', 'Período inválido.');
  const account = getAccount(ctx, organizationId, platform, accountId);
  const reader = readerFor(ctx, organizationId, platform);
  const conn = reader.conn;
  let imported = 0;
  let skipped = 0;
  try {
    const rows = await fetchRemoteInsights(reader, account.remote_id, range, account.currency);
    const now = ctx.now();
    ctx.db.transaction(() => {
      for (const r of rows) {
        const camp = ctx.db.get<{ id: string }>('SELECT id FROM campaigns WHERE organization_id = ? AND platform = ? AND remote_id = ?', [organizationId, platform, r.campaignRemoteId]);
        if (!camp) {
          skipped += 1;
          continue;
        }
        ctx.db.run(
          `INSERT INTO metric_snapshots (id, organization_id, campaign_id, platform, date, currency, spend, impressions, reach, clicks, conversions, revenue, source, definition, fetched_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(campaign_id, date, source) DO UPDATE SET currency = excluded.currency, spend = excluded.spend, impressions = excluded.impressions,
             reach = excluded.reach, clicks = excluded.clicks, conversions = excluded.conversions, revenue = excluded.revenue,
             definition = excluded.definition, fetched_at = excluded.fetched_at`,
          [ctx.newId(), organizationId, camp.id, platform, r.date, r.currency, r.spend, r.impressions, r.reach, r.clicks, r.conversions, r.revenue, platform, DEFINITIONS[platform], now],
        );
        imported += 1;
      }
    });
    setState(ctx, conn.id, 'connected', { error: null });
    recordAudit(ctx, { organizationId, action: `integration.${platform}.syncInsights`, entityType: 'advertising_account', entityId: account.id, details: { ...range, imported, skipped } });
  } catch (err) {
    recordAudit(ctx, { organizationId, action: `integration.${platform}.syncInsights`, entityType: 'advertising_account', entityId: account.id, outcome: 'failure', details: { error: errMsg(err) } });
    throw err;
  }
  const extra = skipped > 0 ? ` ${skipped} linha(s) ignorada(s) por campanha não importada — sincronize as campanhas antes.` : '';
  return { imported, updated: 0, message: `${imported} registro(s) diário(s) de métricas gravado(s).${extra}` };
}

export async function disconnect(ctx: AppContext, organizationId: string, platform: Platform): Promise<IntegrationView> {
  requireOrg(ctx, organizationId);
  const conn = getConn(ctx, organizationId, platform);
  if (!conn) return view(ctx, organizationId, platform);
  if (platform === 'google') {
    const refresh = getSecret(ctx, scopes.org(organizationId, 'google', 'refreshToken'));
    if (refresh) {
      // Revogação é "melhor esforço": o segredo local é apagado de qualquer forma.
      await revokeToken(ctx.fetch, refresh).catch((e: unknown) => ctx.logger.warn('Falha ao revogar token Google', { error: errMsg(e) }));
    }
    accessTokenCache.delete(organizationId);
  }
  ctx.db.transaction(() => {
    for (const f of SECRET_FIELDS[platform]) deleteSecret(ctx, scopes.org(organizationId, platform, f));
    ctx.db.run('DELETE FROM advertising_accounts WHERE connection_id = ?', [conn.id]);
    ctx.db.run("UPDATE integration_connections SET state = 'not_configured', identity = NULL, last_error = NULL, config = '{}', updated_at = ? WHERE id = ?", [ctx.now(), conn.id]);
  });
  recordAudit(ctx, { organizationId, action: `integration.${platform}.disconnect`, entityType: 'integration', entityId: conn.id });
  return view(ctx, organizationId, platform);
}
