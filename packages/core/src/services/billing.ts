import { isoDay, type BillingAccountView, type BillingAlert, type BillingKind, type BillingOverview, type Platform } from '@advertex/shared';
import { isManagerAccountName } from '@advertex/platform-google';
import type { AppContext } from '../context';
import { requireOrg } from '../util';
import { googleAdsClient, metaAdsClient } from './integrations';

/**
 * Saldo e pagamentos (somente leitura). Nenhuma API permite pagar ou
 * adicionar saldo: o painel mostra a situação e abre a página de pagamento
 * da própria plataforma.
 */

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));
const round2 = (v: number) => Math.round(v * 100) / 100;

export function metaPaymentUrl(remoteId: string): string {
  return `https://business.facebook.com/billing_hub/payment_settings/?asset_id=${encodeURIComponent(remoteId)}`;
}
export const GOOGLE_PAYMENT_URL = 'https://ads.google.com/aw/billing/summary';

/**
 * Extrai o valor de um texto como "Saldo disponível (R$1.234,56 BRL)".
 * Aceita separador decimal com vírgula ou ponto (sempre 2 casas no fim).
 */
export function parseMoneyFromText(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = text.match(/\d[\d.,\s]*\d|\d/g);
  if (!m) return null;
  const raw = m[m.length - 1]!.replace(/\s/g, '');
  const dec = raw.match(/[.,](\d{1,2})$/);
  const intPart = (dec ? raw.slice(0, -dec[0].length) : raw).replace(/[.,]/g, '');
  const n = Number(dec ? `${intPart}.${dec[1]}` : intPart);
  return Number.isFinite(n) ? n : null;
}

/** Gasto médio diário (7 dias completos) e gasto de hoje, pelas métricas sincronizadas. */
function spendPace(ctx: AppContext, organizationId: string, accountId: string): { avg7d: number | null; today: number | null } {
  const now = new Date(ctx.now());
  const today = isoDay(0, now);
  const from = isoDay(-7, now);
  const rows = ctx.db.all<{ date: string; spend: number }>(
    `SELECT m.date AS date, SUM(m.spend) AS spend FROM metric_snapshots m JOIN campaigns c ON c.id = m.campaign_id
     WHERE m.organization_id = ? AND c.advertising_account_id = ? AND m.date >= ? AND m.date <= ? GROUP BY m.date`,
    [organizationId, accountId, from, today],
  );
  if (rows.length === 0) return { avg7d: null, today: null };
  const past = rows.filter((r) => r.date < today).reduce((s, r) => s + r.spend, 0);
  const todayRow = rows.find((r) => r.date === today);
  return { avg7d: round2(past / 7), today: todayRow ? round2(todayRow.spend) : null };
}

export function alertFor(daysLeft: number | null): BillingAlert {
  if (daysLeft === null) return 'none';
  if (daysLeft <= 2) return 'critical';
  if (daysLeft <= 5) return 'warning';
  return 'ok';
}

/** Dias até acabar, no ritmo atual: menor entre os limites conhecidos. */
export function daysLeftFrom(remainingValues: Array<number | null>, avgDaily: number | null): number | null {
  if (!avgDaily || avgDaily <= 0) return null;
  const known = remainingValues.filter((v): v is number => v !== null);
  if (known.length === 0) return null;
  return Math.max(0, Math.round((Math.min(...known) / avgDaily) * 10) / 10);
}

interface AccountRow {
  id: string;
  platform: Platform;
  remote_id: string;
  name: string;
  currency: string | null;
  status: string | null;
}

function base(a: AccountRow, pace: { avg7d: number | null; today: number | null }): BillingAccountView {
  return {
    accountId: a.id,
    platform: a.platform,
    remoteId: a.remote_id,
    name: a.name,
    currency: a.currency ?? 'USD',
    status: a.status ?? '',
    kind: 'unknown',
    balance: null,
    amountSpent: null,
    spendCap: null,
    spendCapRemaining: null,
    fundingSource: null,
    budget: null,
    avgDailySpend7d: pace.avg7d,
    spendToday: pace.today,
    daysLeft: null,
    alert: 'none',
    paymentUrl: a.platform === 'meta' ? metaPaymentUrl(a.remote_id) : GOOGLE_PAYMENT_URL,
    notes: [],
    error: null,
  };
}

async function metaView(ctx: AppContext, organizationId: string, a: AccountRow, v: BillingAccountView): Promise<BillingAccountView> {
  const info = await metaAdsClient(ctx, organizationId).getBillingInfo(a.remote_id);
  const kind: BillingKind = info.isPrepay === true ? 'prepaid' : info.isPrepay === false ? 'card' : 'unknown';
  const capRemaining = info.spendCap !== null && info.amountSpent !== null ? round2(Math.max(0, info.spendCap - info.amountSpent)) : null;
  // Pré-pago: o crédito disponível vem no texto da forma de pagamento.
  const prepaidFunds = kind === 'prepaid' ? parseMoneyFromText(info.fundingSource?.display) : null;
  const balance = kind === 'prepaid' ? (prepaidFunds ?? info.balance) : info.balance;
  const notes: string[] = [];
  if (kind === 'prepaid') notes.push('Conta pré-paga (Pix/boleto): os anúncios param quando o saldo acaba.');
  if (kind === 'card') notes.push('Cobrança automática: o saldo é o valor acumulado que ainda será cobrado na forma de pagamento.');
  if (info.spendCap === null) notes.push('Sem limite de gastos definido na conta.');
  const daysLeft = daysLeftFrom([kind === 'prepaid' ? balance : null, capRemaining], v.avgDailySpend7d);
  return {
    ...v,
    name: info.name || v.name,
    currency: info.currency,
    status: info.status || v.status,
    kind,
    balance,
    amountSpent: info.amountSpent,
    spendCap: info.spendCap,
    spendCapRemaining: capRemaining,
    fundingSource: info.fundingSource?.display ?? null,
    daysLeft,
    alert: alertFor(daysLeft),
    notes,
  };
}

async function googleView(ctx: AppContext, organizationId: string, a: AccountRow, v: BillingAccountView): Promise<BillingAccountView> {
  const budgets = await googleAdsClient(ctx, organizationId).fetchAccountBudgets(a.remote_id);
  if (budgets.length === 0) {
    return {
      ...v,
      kind: 'card',
      notes: ['Pagamento automático (cartão): o Google não informa saldo pela API. Acompanhe o gasto por dia abaixo.'],
    };
  }
  // Orçamento vigente: o que ainda não terminou (ou o último).
  const nowIso = ctx.now().replace('T', ' ');
  const current = budgets.find((b) => !b.end || b.end >= nowIso) ?? budgets[budgets.length - 1]!;
  const limit = current.limit === null ? null : round2(current.limit + current.adjustments);
  const remaining = limit === null ? null : round2(Math.max(0, limit - current.served));
  const daysLeft = daysLeftFrom([remaining], v.avgDailySpend7d);
  return {
    ...v,
    kind: 'budget',
    amountSpent: round2(current.served),
    budget: { name: current.name, limit, served: round2(current.served), remaining, start: current.start, end: current.end },
    daysLeft,
    alert: alertFor(daysLeft),
    notes: [limit === null ? 'Orçamento da conta sem limite de valor.' : 'Faturamento por orçamento da conta: os anúncios param quando o orçamento é consumido.'],
  };
}

function demoOverview(ctx: AppContext): BillingOverview {
  const mk = (over: Partial<BillingAccountView> & Pick<BillingAccountView, 'accountId' | 'platform' | 'name'>): BillingAccountView => ({
    remoteId: '0',
    currency: 'BRL',
    status: 'ACTIVE',
    kind: 'unknown',
    balance: null,
    amountSpent: null,
    spendCap: null,
    spendCapRemaining: null,
    fundingSource: null,
    budget: null,
    avgDailySpend7d: null,
    spendToday: null,
    daysLeft: null,
    alert: 'none',
    paymentUrl: over.platform === 'meta' ? metaPaymentUrl('0') : GOOGLE_PAYMENT_URL,
    notes: ['Dados de demonstração.'],
    error: null,
    ...over,
  });
  return {
    checkedAt: ctx.now(),
    accounts: [
      mk({ accountId: 'demo-meta-pix', platform: 'meta', name: 'Loja Demo · Meta (Pix)', kind: 'prepaid', balance: 186.4, amountSpent: 4213.9, fundingSource: 'Saldo disponível (R$186,40 BRL)', avgDailySpend7d: 92.5, spendToday: 41.2, daysLeft: 2, alert: 'critical' }),
      mk({ accountId: 'demo-meta-card', platform: 'meta', name: 'Loja Demo · Meta (cartão)', kind: 'card', balance: 312.75, amountSpent: 9870, spendCap: 15000, spendCapRemaining: 5130, fundingSource: 'Visa •••• 4242', avgDailySpend7d: 140, spendToday: 63.1, daysLeft: 36.6, alert: 'ok' }),
      mk({ accountId: 'demo-google-budget', platform: 'google', name: 'Loja Demo · Google (orçamento)', kind: 'budget', amountSpent: 2650, budget: { name: 'Orçamento mensal', limit: 3000, served: 2650, remaining: 350, start: null, end: null }, avgDailySpend7d: 85, spendToday: 30, daysLeft: 4.1, alert: 'warning' }),
      mk({ accountId: 'demo-google-card', platform: 'google', name: 'Loja Demo · Google (cartão)', kind: 'card', avgDailySpend7d: 60, spendToday: 22.4, notes: ['Pagamento automático (cartão): o Google não informa saldo pela API.'] }),
    ],
  };
}

/** Visão de saldo e pagamentos de todas as contas conectadas (cada conta é independente). */
export async function getBillingOverview(ctx: AppContext, organizationId: string): Promise<BillingOverview> {
  if (requireOrg(ctx, organizationId).is_demo) return demoOverview(ctx);
  const accounts = ctx.db.all<AccountRow>(
    `SELECT a.id, a.platform, a.remote_id, a.name, a.currency, a.status FROM advertising_accounts a
     JOIN integration_connections c ON c.id = a.connection_id WHERE a.organization_id = ? ORDER BY a.platform DESC, a.name`,
    [organizationId],
  );
  const out: BillingAccountView[] = [];
  for (const a of accounts) {
    if (a.platform === 'google' && isManagerAccountName(a.name)) continue;
    const v = base(a, spendPace(ctx, organizationId, a.id));
    try {
      out.push(a.platform === 'meta' ? await metaView(ctx, organizationId, a, v) : await googleView(ctx, organizationId, a, v));
    } catch (err) {
      out.push({ ...v, error: errMsg(err) });
    }
  }
  return { accounts: out, checkedAt: ctx.now() };
}
