import { createHash } from 'node:crypto';
import { learningsBrief, minePatterns, ruleFeatures, type BrainAd, type DateRange, type RemoteAdPerformance } from '@advertex/advertising-core';
import { buildCreativeTaggingPrompt, buildPlaybookPrompt, CreativeTaggingOutput, PlaybookOutput } from '@advertex/ai-core';
import { AppError, BrainSyncRequest, isoDay, type AdPerformance, type CreativeBrainReport, type Platform } from '@advertex/shared';
import type { AppContext } from '../context';
import type { Param } from '../db/database';
import { parseJson, requireOrg } from '../util';
import { aiProvider, runAiJob } from './ai';
import { recordAudit } from './audit';
import { assertNotDemo, getAccount, googleAdsClient, metaAdsClient } from './integrations';
import { getSetting, setSetting } from './settings';

/**
 * Cérebro criativo: importa o desempenho de cada anúncio, descreve o criativo
 * (características objetivas + classificação por IA) e descobre quais
 * características se associam a CTR e conversão melhores NESTA conta.
 */

interface PerfRow {
  id: string;
  platform: Platform;
  account_name: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  project_id: string | null;
  remote_ad_id: string;
  remote_ad_group_id: string | null;
  ad_name: string;
  status: string;
  headline: string;
  body: string;
  cta: string;
  image_url: string | null;
  content_hash: string;
  period_from: string;
  period_to: string;
  currency: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number | null;
  source: 'demo' | 'meta' | 'google';
  ai_features: string | null;
}

export function contentHash(headline: string, body: string): string {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  return createHash('sha256').update(`${norm(headline)}\n${norm(body)}`).digest('hex').slice(0, 32);
}

const playbookKey = (org: string) => `brain.playbook.${org}`;
const useKey = (org: string) => `brain.useLearnings.${org}`;

function loadRows(ctx: AppContext, organizationId: string, f: { platform?: Platform | null; projectId?: string | null } = {}): PerfRow[] {
  const where = ['p.organization_id = ?'];
  const params: Param[] = [organizationId];
  if (f.platform) {
    where.push('p.platform = ?');
    params.push(f.platform);
  }
  if (f.projectId) {
    where.push('c.project_id = ?');
    params.push(f.projectId);
  }
  return ctx.db.all<PerfRow>(
    `SELECT p.*, a.name AS account_name, c.name AS campaign_name, c.project_id AS project_id, cf.features AS ai_features
     FROM ad_performance p
     LEFT JOIN advertising_accounts a ON a.id = p.advertising_account_id
     LEFT JOIN campaigns c ON c.id = p.campaign_id
     LEFT JOIN creative_features cf ON cf.organization_id = p.organization_id AND cf.content_hash = p.content_hash
     WHERE ${where.join(' AND ')}
     ORDER BY p.spend DESC`,
    params,
  );
}

function toAd(r: PerfRow): AdPerformance {
  const ai = parseJson<Record<string, string>>(r.ai_features, {});
  return {
    id: r.id,
    platform: r.platform,
    accountName: r.account_name,
    campaignId: r.campaign_id,
    campaignName: r.campaign_name,
    projectId: r.project_id,
    remoteAdId: r.remote_ad_id,
    adName: r.ad_name,
    status: r.status,
    headline: r.headline,
    body: r.body,
    cta: r.cta,
    imageUrl: r.image_url,
    periodFrom: r.period_from,
    periodTo: r.period_to,
    currency: r.currency,
    spend: r.spend,
    impressions: r.impressions,
    clicks: r.clicks,
    conversions: r.conversions,
    revenue: r.revenue,
    ctr: r.impressions > 0 ? r.clicks / r.impressions : null,
    cpa: r.conversions > 0 ? r.spend / r.conversions : null,
    conversionRate: r.clicks > 0 ? r.conversions / r.clicks : null,
    features: platformFeatures(r.platform, { ...ruleFeatures({ headline: r.headline, body: r.body, cta: r.cta }), ...ai }),
    aiTagged: r.ai_features !== null,
    source: r.source,
  };
}

/** No Google o "título" é a junção de vários títulos do RSA: o tamanho não descreve o criativo. */
function platformFeatures(platform: Platform, f: Record<string, string>): Record<string, string> {
  if (platform === 'google') {
    const { tamanho_titulo: _t, ...rest } = f;
    return rest;
  }
  return f;
}

/** Importa o desempenho por anúncio da conta (substitui o retrato anterior da mesma conta). */
export async function syncAdPerformance(ctx: AppContext, organizationId: string, platform: Platform, raw: unknown, today: Date = new Date()): Promise<{ imported: number; message: string }> {
  assertNotDemo(ctx, organizationId);
  const req = BrainSyncRequest.parse(raw);
  const account = getAccount(ctx, organizationId, platform, req.accountId);
  const range: DateRange = { from: isoDay(-req.days, today), to: isoDay(-1, today) };
  let rows: RemoteAdPerformance[];
  try {
    rows =
      platform === 'meta'
        ? await metaAdsClient(ctx, organizationId).fetchAdPerformance(account.remote_id, range)
        : await googleAdsClient(ctx, organizationId).fetchAdPerformance(account.remote_id, range, account.currency ?? 'USD');
  } catch (err) {
    recordAudit(ctx, { organizationId, action: 'brain.sync', entityType: 'advertising_account', entityId: account.id, outcome: 'failure', details: { error: err instanceof Error ? err.message : String(err) } });
    throw err;
  }
  storeAdPerformance(ctx, organizationId, platform, account.id, range, rows, platform);
  recordAudit(ctx, { organizationId, action: 'brain.sync', entityType: 'advertising_account', entityId: account.id, details: { ...range, ads: rows.length } });
  const withText = rows.filter((r) => r.headline || r.body).length;
  return {
    imported: rows.length,
    message: `${rows.length} anúncio(s) com desempenho de ${range.from} a ${range.to}${rows.length > withText ? ` (${rows.length - withText} sem texto legível, como catálogos dinâmicos)` : ''}.`,
  };
}

export function storeAdPerformance(
  ctx: AppContext,
  organizationId: string,
  platform: Platform,
  accountId: string | null,
  range: DateRange,
  rows: RemoteAdPerformance[],
  source: 'demo' | 'meta' | 'google',
): void {
  const now = ctx.now();
  ctx.db.transaction(() => {
    if (accountId) ctx.db.run('DELETE FROM ad_performance WHERE organization_id = ? AND platform = ? AND advertising_account_id = ?', [organizationId, platform, accountId]);
    for (const r of rows) {
      const camp = r.remoteCampaignId
        ? ctx.db.get<{ id: string }>('SELECT id FROM campaigns WHERE organization_id = ? AND platform = ? AND remote_id = ?', [organizationId, platform, r.remoteCampaignId])
        : undefined;
      ctx.db.run(
        `INSERT INTO ad_performance (id, organization_id, platform, advertising_account_id, campaign_id, remote_ad_id, remote_campaign_id, remote_ad_group_id, ad_name, status,
           headline, body, cta, image_url, content_hash, period_from, period_to, currency, spend, impressions, reach, clicks, conversions, revenue, source, fetched_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(organization_id, platform, remote_ad_id) DO UPDATE SET advertising_account_id = excluded.advertising_account_id, campaign_id = excluded.campaign_id,
           remote_campaign_id = excluded.remote_campaign_id, remote_ad_group_id = excluded.remote_ad_group_id, ad_name = excluded.ad_name, status = excluded.status,
           headline = excluded.headline, body = excluded.body, cta = excluded.cta, image_url = excluded.image_url, content_hash = excluded.content_hash,
           period_from = excluded.period_from, period_to = excluded.period_to, currency = excluded.currency, spend = excluded.spend, impressions = excluded.impressions,
           reach = excluded.reach, clicks = excluded.clicks, conversions = excluded.conversions, revenue = excluded.revenue, source = excluded.source, fetched_at = excluded.fetched_at`,
        [
          ctx.newId(),
          organizationId,
          platform,
          accountId,
          camp?.id ?? null,
          r.remoteAdId,
          r.remoteCampaignId,
          r.remoteAdGroupId,
          r.adName.slice(0, 300),
          r.status,
          r.headline.slice(0, 1000),
          r.body.slice(0, 4000),
          r.cta,
          r.imageUrl && /^https:\/\//.test(r.imageUrl) ? r.imageUrl : null,
          contentHash(r.headline, r.body),
          range.from,
          range.to,
          r.currency,
          Math.max(0, r.spend),
          Math.max(0, Math.round(r.impressions)),
          r.reach,
          Math.max(0, Math.round(r.clicks)),
          Math.max(0, r.conversions),
          r.revenue,
          source,
          now,
        ],
      );
    }
  });
}

/** Classifica com IA (ângulo, emoção, tom, gancho) os textos ainda não classificados. */
export async function tagCreativesWithAi(ctx: AppContext, organizationId: string, max = 80): Promise<{ tagged: number; remaining: number; model: string | null }> {
  requireOrg(ctx, organizationId);
  const pending = ctx.db.all<{ content_hash: string; headline: string; body: string }>(
    `SELECT p.content_hash, MAX(p.headline) AS headline, MAX(p.body) AS body FROM ad_performance p
     LEFT JOIN creative_features cf ON cf.organization_id = p.organization_id AND cf.content_hash = p.content_hash
     WHERE p.organization_id = ? AND cf.id IS NULL AND (p.headline != '' OR p.body != '')
     GROUP BY p.content_hash ORDER BY SUM(p.impressions) DESC`,
    [organizationId],
  );
  if (pending.length === 0) return { tagged: 0, remaining: 0, model: null };
  const p = aiProvider(ctx);
  const batch = pending.slice(0, max);
  let tagged = 0;
  let model: string | null = null;
  for (let i = 0; i < batch.length; i += 20) {
    const chunk = batch.slice(i, i + 20).map((r, j) => ({ id: String(i + j + 1), hash: r.content_hash, headline: r.headline, body: r.body }));
    const prompt = buildCreativeTaggingPrompt(chunk);
    const res = await runAiJob(ctx, { organizationId, projectId: null, kind: 'brain.tag' }, p, () =>
      p.generateStructured({ ...prompt, schema: CreativeTaggingOutput, maxTokens: 6000, effort: 'low' }),
    );
    model = res.model;
    const now = ctx.now();
    ctx.db.transaction(() => {
      for (const item of res.data.items) {
        const src = chunk.find((c) => c.id === item.id);
        if (!src) continue;
        const features = { angulo: item.angulo, emocao: item.emocao, tom: item.tom, gancho: item.gancho };
        ctx.db.run(
          `INSERT INTO creative_features (id, organization_id, content_hash, features, model, created_at) VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(organization_id, content_hash) DO UPDATE SET features = excluded.features, model = excluded.model, created_at = excluded.created_at`,
          [ctx.newId(), organizationId, src.hash, JSON.stringify(features), res.model, now],
        );
        tagged += 1;
      }
    });
  }
  recordAudit(ctx, { organizationId, action: 'brain.tag', entityType: 'organization', entityId: organizationId, details: { tagged, model } });
  return { tagged, remaining: Math.max(0, pending.length - tagged), model };
}

const MIN_RANK_IMPRESSIONS = 500;

export function getBrainReport(ctx: AppContext, organizationId: string, f: { platform?: Platform | null; projectId?: string | null } = {}): CreativeBrainReport {
  requireOrg(ctx, organizationId);
  const ads = loadRows(ctx, organizationId, f).map(toAd);
  const withText = ads.filter((a) => a.headline || a.body);
  const toBrain = (a: AdPerformance): BrainAd => ({ id: a.id, impressions: a.impressions, clicks: a.clicks, conversions: a.conversions, spend: a.spend, features: a.features });
  // Cada plataforma é analisada separadamente: CTR de Pesquisa e de feed têm bases muito diferentes.
  const platforms = [...new Set(withText.map((a) => a.platform))];
  const patterns = platforms
    .flatMap((pl) => minePatterns(withText.filter((a) => a.platform === pl).map(toBrain), undefined, pl))
    .sort((a, b) => b.confidence * Math.abs(b.lift) - a.confidence * Math.abs(a.lift));
  const brainAds = withText.map(toBrain);
  const t = ads.reduce((s, a) => ({ i: s.i + a.impressions, c: s.c + a.clicks, v: s.v + a.conversions, sp: s.sp + a.spend }), { i: 0, c: 0, v: 0, sp: 0 });
  const ranked = withText.filter((a) => a.impressions >= MIN_RANK_IMPRESSIONS);
  const useConv = t.v >= 20;
  // Pontuação relativa à média da própria plataforma: com conversões suficientes, conversões por mil
  // impressões (une atenção e conversão); senão, CTR.
  const raw = (a: AdPerformance) => (useConv ? (a.conversions / Math.max(1, a.impressions)) * 1000 : (a.ctr ?? 0));
  const avg = new Map<Platform, number>();
  for (const pl of platforms) {
    const list = ranked.filter((a) => a.platform === pl);
    const i = list.reduce((s, a) => s + a.impressions, 0);
    const v = list.reduce((s, a) => s + (useConv ? a.conversions : a.clicks), 0);
    avg.set(pl, i > 0 ? (useConv ? (v / i) * 1000 : v / i) : 0);
  }
  const score = (a: AdPerformance) => raw(a) / (avg.get(a.platform) || 1);
  const sorted = [...ranked].sort((a, b) => score(b) - score(a));
  const limitations: string[] = [];
  if (ads.length === 0) limitations.push('Nenhum anúncio importado ainda. Escolha uma conta e clique em "Importar desempenho dos anúncios".');
  else if (brainAds.length < 6) limitations.push('Poucos anúncios com texto para comparar: os padrões ficam mais confiáveis a partir de ~10 anúncios com volume.');
  if (ads.length > 0 && !useConv) limitations.push('Menos de 20 conversões no período: o ranking usa CTR (atenção). Com mais conversões, passa a usar conversões por mil impressões.');
  limitations.push('Associação não é causa: o padrão indica o que testar primeiro, não garante resultado. Confirme com um experimento A/B.');
  const pending = ads.filter((a) => !a.aiTagged && (a.headline || a.body));
  const pendingHashes = new Set(pending.map((a) => contentHash(a.headline, a.body)));
  return {
    periodFrom: ads.length ? ads.reduce((m, a) => (a.periodFrom < m ? a.periodFrom : m), ads[0]!.periodFrom) : null,
    periodTo: ads.length ? ads.reduce((m, a) => (a.periodTo > m ? a.periodTo : m), ads[0]!.periodTo) : null,
    totals: { ads: ads.length, impressions: t.i, clicks: t.c, conversions: t.v, spend: t.sp, ctr: t.i > 0 ? t.c / t.i : null, conversionRate: t.c > 0 ? t.v / t.c : null },
    analyzedAds: brainAds.filter((a) => a.impressions >= 200).length,
    pendingAiTagging: pendingHashes.size,
    patterns,
    winners: sorted.slice(0, 5),
    losers: sorted.length > 5 ? sorted.slice(-5).reverse() : [],
    playbook: getSetting<CreativeBrainReport['playbook']>(ctx, playbookKey(organizationId), null),
    useLearnings: getSetting<boolean>(ctx, useKey(organizationId), true),
    limitations,
  };
}

export async function generatePlaybook(ctx: AppContext, organizationId: string): Promise<CreativeBrainReport> {
  const report = getBrainReport(ctx, organizationId);
  if (report.winners.length === 0) throw new AppError('VALIDATION', 'Importe o desempenho dos anúncios antes de gerar o playbook.');
  const p = aiProvider(ctx);
  const metric = (a: AdPerformance) =>
    `CTR ${((a.ctr ?? 0) * 100).toFixed(2)}%${a.cpa !== null ? `, CPA ${a.cpa.toFixed(2)} ${a.currency}` : ''}, ${a.impressions} impressões`;
  const prompt = buildPlaybookPrompt({
    patterns: report.patterns.slice(0, 15).map((x) => x.sentence),
    winners: report.winners.map((a) => ({ headline: a.headline, body: a.body, metric: metric(a) })),
    losers: report.losers.map((a) => ({ headline: a.headline, body: a.body, metric: metric(a) })),
  });
  const { data, model } = await runAiJob(ctx, { organizationId, projectId: null, kind: 'brain.playbook' }, p, () =>
    p.generateStructured({ ...prompt, schema: PlaybookOutput, maxTokens: 4000, effort: 'medium' }),
  );
  setSetting(ctx, playbookKey(organizationId), { rules: data.rules, summary: data.summary, model, createdAt: ctx.now() });
  recordAudit(ctx, { organizationId, action: 'brain.playbook', entityType: 'organization', entityId: organizationId, details: { model, rules: data.rules.length } });
  return getBrainReport(ctx, organizationId);
}

export function setUseLearnings(ctx: AppContext, organizationId: string, enabled: boolean): CreativeBrainReport {
  requireOrg(ctx, organizationId);
  setSetting(ctx, useKey(organizationId), enabled);
  recordAudit(ctx, { organizationId, action: 'brain.useLearnings', entityType: 'organization', entityId: organizationId, details: { enabled } });
  return getBrainReport(ctx, organizationId);
}

/**
 * Aprendizados para orientar a geração (textos, anúncios de pesquisa, imagens).
 * Vazio quando desativado ou sem evidência suficiente.
 */
export function learningsFor(ctx: AppContext, organizationId: string, projectId: string | null = null): string {
  if (!getSetting<boolean>(ctx, useKey(organizationId), true)) return '';
  const hasData = ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM ad_performance WHERE organization_id = ?', [organizationId])?.n ?? 0;
  if (hasData === 0) return '';
  let report = getBrainReport(ctx, organizationId, { projectId });
  if (projectId && report.patterns.length === 0) report = getBrainReport(ctx, organizationId);
  const lines = learningsBrief(report.patterns);
  const rules = report.playbook?.rules.slice(0, 6).map((r) => `• ${r}`).join('\n') ?? '';
  return [lines, rules && `Playbook da conta:\n${rules}`].filter(Boolean).join('\n');
}

export function getAdPerformance(ctx: AppContext, organizationId: string, id: string): AdPerformance {
  const row = loadRows(ctx, organizationId).find((r) => r.id === id);
  if (!row) throw new AppError('NOT_FOUND', 'Anúncio não encontrado no Cérebro criativo.');
  return toAd(row);
}

export function listAdPerformance(ctx: AppContext, organizationId: string, f: { platform?: Platform | null; projectId?: string | null } = {}): AdPerformance[] {
  requireOrg(ctx, organizationId);
  return loadRows(ctx, organizationId, f).map(toAd);
}
