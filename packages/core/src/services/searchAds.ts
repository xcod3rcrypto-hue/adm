import {
  AppError,
  KeywordIdeasRequest,
  type PageAnalysis,
  type SearchAdDraft,
  SearchAdGroupInput,
  type KeywordIdeasResult,
  type KeywordMatchType,
  type SearchAdGroup,
  type SyncState,
} from '@advertex/shared';
import { validateText } from '@advertex/advertising-core';
import { KeywordSuggestionsOutput, SearchAdFromPageOutput, buildKeywordPrompt, buildSearchAdFromPagePrompt } from '@advertex/ai-core';
import { isManagerAccountName } from '@advertex/platform-google';
import type { AppContext } from '../context';
import { parseJson, requireOrg } from '../util';
import { aiProvider, runAiJob } from './ai';
import { recordAudit } from './audit';
import { getBrief } from './briefs';
import { getCampaign } from './campaigns';
import { googleAdsClient } from './integrations';
import { getProject } from './projects';
import { runPlatformOperation } from './publishing';

/**
 * Estrutura de campanhas de Pesquisa no Google Ads: ideias de palavras-chave
 * (Planejador do Google ou IA), grupo de anúncios, palavras-chave, negativas e
 * anúncio responsivo. O grupo é montado localmente e enviado em etapas
 * idempotentes; se uma etapa falhar, o envio retoma de onde parou.
 */

const LANGUAGE_ID = { pt: '1014', en: '1000', es: '1003' } as const;
const GEO_ID = { BR: '2076', PT: '2620', US: '2840' } as const;

interface Steps {
  adGroup: boolean;
  keywords: boolean;
  negatives: boolean;
  ad: boolean;
}

interface Settings {
  cpcBid: number | null;
  keywords: Array<{ text: string; matchType: KeywordMatchType }>;
  negativeKeywords: string[];
  ad: { finalUrl: string; path1: string; path2: string; headlines: string[]; descriptions: string[]; remoteId: string | null };
  steps: Steps;
}

interface AdGroupRow {
  id: string;
  campaign_id: string;
  name: string;
  remote_id: string | null;
  settings: string;
  sync_state: SyncState;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

const NO_STEPS: Steps = { adGroup: false, keywords: false, negatives: false, ad: false };

function toAdGroup(r: AdGroupRow): SearchAdGroup {
  const s = parseJson<Partial<Settings>>(r.settings, {});
  return {
    id: r.id,
    campaignId: r.campaign_id,
    name: r.name,
    remoteId: r.remote_id,
    cpcBid: s.cpcBid ?? null,
    keywords: s.keywords ?? [],
    negativeKeywords: s.negativeKeywords ?? [],
    ad: s.ad ?? { finalUrl: '', path1: '', path2: '', headlines: [], descriptions: [], remoteId: null },
    steps: { ...NO_STEPS, ...s.steps },
    syncState: r.sync_state,
    lastError: r.last_error,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function requireGoogleSearchCampaign(ctx: AppContext, organizationId: string, campaignId: string) {
  const c = getCampaign(ctx, organizationId, campaignId);
  if (c.platform !== 'google') throw new AppError('VALIDATION', 'Grupos de anúncios de Pesquisa são exclusivos de campanhas do Google Ads.');
  if (c.objective !== 'SEARCH') throw new AppError('VALIDATION', 'Esta campanha não é de Pesquisa. Palavras-chave e anúncios responsivos de pesquisa só se aplicam a campanhas SEARCH.');
  return c;
}

/** Conta usada para consultas do Google: a da campanha ou a primeira conta de anúncios (não MCC). */
function googleAccountFor(ctx: AppContext, organizationId: string, accountId: string | null): { id: string; remote_id: string; name: string; currency: string | null } {
  const rows = ctx.db.all<{ id: string; remote_id: string; name: string; currency: string | null }>(
    "SELECT id, remote_id, name, currency FROM advertising_accounts WHERE organization_id = ? AND platform = 'google' ORDER BY name",
    [organizationId],
  );
  const chosen = (accountId && rows.find((r) => r.id === accountId)) || rows.find((r) => !isManagerAccountName(r.name));
  if (!chosen) throw new AppError('NOT_CONFIGURED', 'Nenhuma conta de anúncios do Google sincronizada. Em Integrações → Google Ads, clique em Buscar contas.');
  if (isManagerAccountName(chosen.name)) throw new AppError('VALIDATION', 'A campanha está vinculada a uma conta de administrador (MCC). Use uma conta de anúncios.');
  return chosen;
}

// ---------------------------------------------------------------------------
// Ideias de palavras-chave
// ---------------------------------------------------------------------------

export async function keywordIdeasFromGoogle(ctx: AppContext, organizationId: string, campaignId: string, raw: unknown): Promise<KeywordIdeasResult> {
  const c = requireGoogleSearchCampaign(ctx, organizationId, campaignId);
  const req = KeywordIdeasRequest.parse(raw);
  let url = req.url;
  if (!url && req.seeds.length === 0 && c.projectId) url = getBrief(ctx, organizationId, c.projectId)?.data.websiteUrl ?? '';
  if (!url && req.seeds.length === 0) throw new AppError('VALIDATION', 'Informe ao menos uma palavra-semente ou a URL do site.');
  const account = googleAccountFor(ctx, organizationId, c.advertisingAccountId);
  const client = googleAdsClient(ctx, organizationId);
  try {
    const rows = await client.generateKeywordIdeas(account.remote_id, { seeds: req.seeds, url, languageId: LANGUAGE_ID[req.language], geoTargetId: GEO_ID[req.location], limit: 80 });
    recordAudit(ctx, { organizationId, action: 'google.keywordIdeas', entityType: 'campaign', entityId: campaignId, details: { seeds: req.seeds.length, results: rows.length } });
    const micros = (v: number | null) => (v === null ? null : Math.round(v / 10_000) / 100);
    return {
      source: 'google',
      ideas: rows
        .sort((a, b) => (b.avgMonthlySearches ?? -1) - (a.avgMonthlySearches ?? -1))
        .map((r) => ({
          text: r.text,
          source: 'google',
          avgMonthlySearches: r.avgMonthlySearches,
          competition: r.competition,
          lowBid: micros(r.lowBidMicros),
          highBid: micros(r.highBidMicros),
          suggestedMatchType: null,
          note: null,
        })),
      negatives: [],
      notes: [
        `Dados do Planejador de Palavras-chave do Google (${req.location}, idioma ${req.language}); lances na moeda da conta ${account.currency ?? ''}.`.trim(),
        'Volumes são médias mensais aproximadas fornecidas pelo Google.',
      ],
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new AppError('EXTERNAL_API', `${msg} Se o seu nível de acesso à API não incluir o Planejador de Palavras-chave, use "Ideias com IA".`, { cause: err });
  }
}

export async function keywordIdeasFromAi(ctx: AppContext, organizationId: string, campaignId: string, seeds: string[]): Promise<KeywordIdeasResult> {
  const c = requireGoogleSearchCampaign(ctx, organizationId, campaignId);
  if (!c.projectId) throw new AppError('VALIDATION', 'Vincule a campanha a um projeto com briefing para gerar ideias com IA.');
  const brief = getBrief(ctx, organizationId, c.projectId);
  if (!brief) throw new AppError('VALIDATION', 'Preencha o briefing do projeto para gerar ideias com IA.');
  const project = getProject(ctx, organizationId, c.projectId);
  const p = aiProvider(ctx);
  const prompt = buildKeywordPrompt({ brief: brief.data, projectName: project.name, seeds: seeds.slice(0, 20), campaignName: c.name });
  const { data, model } = await runAiJob(ctx, { organizationId, projectId: c.projectId, kind: 'keywords' }, p, () =>
    p.generateStructured({ ...prompt, schema: KeywordSuggestionsOutput, maxTokens: 8000, effort: 'low' }),
  );
  const clean = (t: string) => t.replace(/[!@%,*=]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  const seen = new Set<string>();
  const ideas = data.keywords
    .map((k) => ({ ...k, text: clean(k.text) }))
    .filter((k) => k.text && k.text.split(' ').length <= 10 && !seen.has(k.text.toLowerCase()) && seen.add(k.text.toLowerCase()))
    .map((k) => ({ text: k.text, source: 'ai' as const, avgMonthlySearches: null, competition: null, lowBid: null, highBid: null, suggestedMatchType: k.matchType, note: k.intent }));
  recordAudit(ctx, { organizationId, action: 'ai.keywords', entityType: 'campaign', entityId: campaignId, details: { model, ideas: ideas.length } });
  return {
    source: 'ai',
    ideas,
    negatives: [...new Set(data.negatives.map(clean).filter(Boolean))],
    notes: [`Sugestões da IA (${model}) a partir do briefing. Não incluem volume de buscas: confira no Planejador do Google antes de investir.`],
  };
}

// ---------------------------------------------------------------------------
// Grupos de anúncios (montagem local + envio em etapas)
// ---------------------------------------------------------------------------

function validateAdTexts(d: ReturnType<typeof SearchAdGroupInput.parse>): void {
  const problems = [
    ...d.ad.headlines.map((h, i) => ({ v: validateText('google_rsa_headline', h), label: `Título ${i + 1}` })),
    ...d.ad.descriptions.map((h, i) => ({ v: validateText('google_rsa_description', h), label: `Descrição ${i + 1}` })),
  ].filter((x) => !x.v.withinLimit);
  if (problems.length) {
    throw new AppError('VALIDATION', `Textos acima do limite do Google: ${problems.map((p) => `${p.label} (${p.v.count}/${p.v.limit})`).join(', ')}.`);
  }
  const dupKeywords = new Set<string>();
  for (const k of d.keywords) {
    const key = `${k.matchType}:${k.text.toLowerCase()}`;
    if (dupKeywords.has(key)) throw new AppError('VALIDATION', `Palavra-chave repetida: "${k.text}" (${k.matchType}).`);
    dupKeywords.add(key);
  }
}

function getRow(ctx: AppContext, organizationId: string, id: string): AdGroupRow {
  const r = ctx.db.get<AdGroupRow>("SELECT * FROM ad_groups WHERE id = ? AND organization_id = ? AND platform = 'google'", [id, organizationId]);
  if (!r) throw new AppError('NOT_FOUND', 'Grupo de anúncios não encontrado.');
  return r;
}

export function listSearchAdGroups(ctx: AppContext, organizationId: string, campaignId: string): SearchAdGroup[] {
  requireOrg(ctx, organizationId);
  getCampaign(ctx, organizationId, campaignId);
  return ctx.db
    .all<AdGroupRow>("SELECT * FROM ad_groups WHERE organization_id = ? AND campaign_id = ? AND platform = 'google' ORDER BY created_at", [organizationId, campaignId])
    .map(toAdGroup);
}

export function saveSearchAdGroup(ctx: AppContext, organizationId: string, campaignId: string, id: string | null, raw: unknown): SearchAdGroup {
  requireGoogleSearchCampaign(ctx, organizationId, campaignId);
  const d = SearchAdGroupInput.parse(raw);
  validateAdTexts(d);
  const now = ctx.now();
  if (id) {
    const current = toAdGroup(getRow(ctx, organizationId, id));
    if (current.campaignId !== campaignId) throw new AppError('NOT_FOUND', 'Grupo de anúncios não encontrado.');
    if (current.steps.adGroup) throw new AppError('CONFLICT', 'Este grupo já foi enviado ao Google Ads. Edite-o no Google Ads.');
  }
  const settings: Settings = {
    cpcBid: d.cpcBid,
    keywords: d.keywords,
    negativeKeywords: d.negativeKeywords,
    ad: { ...d.ad, remoteId: null },
    steps: { ...NO_STEPS },
  };
  const rowId = id ?? ctx.newId();
  if (id) {
    ctx.db.run("UPDATE ad_groups SET name = ?, settings = ?, sync_state = 'local_only', last_error = NULL, updated_at = ? WHERE id = ? AND organization_id = ?", [
      d.name,
      JSON.stringify(settings),
      now,
      id,
      organizationId,
    ]);
  } else {
    ctx.db.run(
      "INSERT INTO ad_groups (id, organization_id, campaign_id, platform, name, status, settings, sync_state, created_at, updated_at) VALUES (?, ?, ?, 'google', ?, 'draft', ?, 'local_only', ?, ?)",
      [rowId, organizationId, campaignId, d.name, JSON.stringify(settings), now, now],
    );
  }
  recordAudit(ctx, { organizationId, action: id ? 'adgroup.update' : 'adgroup.create', entityType: 'ad_group', entityId: rowId, details: { keywords: d.keywords.length, headlines: d.ad.headlines.length } });
  return toAdGroup(getRow(ctx, organizationId, rowId));
}

export function deleteSearchAdGroup(ctx: AppContext, organizationId: string, id: string): void {
  const g = toAdGroup(getRow(ctx, organizationId, id));
  if (g.steps.adGroup) throw new AppError('CONFLICT', 'Este grupo já existe no Google Ads; remova-o pelo Google Ads.');
  ctx.db.run('DELETE FROM ad_groups WHERE id = ? AND organization_id = ?', [id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'adgroup.delete', entityType: 'ad_group', entityId: id });
}

/**
 * Envia o grupo ao Google Ads em etapas: grupo → palavras-chave → negativas →
 * anúncio. Cada etapa é idempotente; etapas concluídas são puladas ao repetir.
 */
export async function pushSearchAdGroup(ctx: AppContext, organizationId: string, id: string): Promise<SearchAdGroup> {
  const row = getRow(ctx, organizationId, id);
  const g = toAdGroup(row);
  const c = requireGoogleSearchCampaign(ctx, organizationId, g.campaignId);
  if (!c.remoteId || !c.advertisingAccountId) throw new AppError('VALIDATION', 'Publique a campanha no Google Ads antes de enviar o grupo de anúncios.');
  const account = googleAccountFor(ctx, organizationId, c.advertisingAccountId);
  const client = googleAdsClient(ctx, organizationId);
  const settings = parseJson<Settings>(row.settings, {} as Settings);
  settings.steps = { ...NO_STEPS, ...settings.steps };
  let remoteId = row.remote_id;

  const save = (patch: { syncState?: SyncState; error?: string | null }) =>
    ctx.db.run('UPDATE ad_groups SET remote_id = ?, settings = ?, sync_state = COALESCE(?, sync_state), last_error = ?, last_synced_at = ?, updated_at = ? WHERE id = ?', [
      remoteId,
      JSON.stringify(settings),
      patch.syncState ?? null,
      patch.error ?? null,
      ctx.now(),
      ctx.now(),
      id,
    ]);
  const base = { organizationId, campaignId: c.id, platform: 'google' as const };

  ctx.db.run("UPDATE ad_groups SET sync_state = 'pending', last_error = NULL WHERE id = ?", [id]);
  try {
    if (!settings.steps.adGroup) {
      const out = await runPlatformOperation(
        ctx,
        { ...base, operation: 'createAdGroup', idempotencyKey: `adGroup:${id}`, request: { campaign: c.remoteId, name: g.name, cpcBid: g.cpcBid } },
        () => client.createAdGroup(account.remote_id, c.remoteId!, { name: g.name, cpcBid: g.cpcBid }),
        () => client.findAdGroupByName(account.remote_id, c.remoteId!, g.name),
      );
      remoteId = out.remoteId;
      settings.steps.adGroup = true;
      save({});
    }
    if (!settings.steps.keywords) {
      await runPlatformOperation(
        ctx,
        { ...base, operation: 'addKeywords', idempotencyKey: `keywords:${id}`, request: { adGroup: remoteId, count: g.keywords.length } },
        async () => {
          await client.addKeywords(account.remote_id, remoteId!, g.keywords);
          return { remoteId };
        },
      );
      settings.steps.keywords = true;
      save({});
    }
    if (!settings.steps.negatives) {
      if (g.negativeKeywords.length > 0) {
        await runPlatformOperation(
          ctx,
          { ...base, operation: 'addNegativeKeywords', idempotencyKey: `negatives:${id}`, request: { campaign: c.remoteId, count: g.negativeKeywords.length } },
          async () => {
            await client.addNegativeKeywords(account.remote_id, c.remoteId!, g.negativeKeywords);
            return { remoteId: c.remoteId };
          },
        );
      }
      settings.steps.negatives = true;
      save({});
    }
    if (!settings.steps.ad) {
      const out = await runPlatformOperation(
        ctx,
        { ...base, operation: 'createResponsiveSearchAd', idempotencyKey: `rsa:${id}`, request: { adGroup: remoteId, headlines: g.ad.headlines.length, descriptions: g.ad.descriptions.length } },
        () => client.createResponsiveSearchAd(account.remote_id, remoteId!, g.ad),
        async () => (await client.countAds(account.remote_id, remoteId!)).firstId,
      );
      settings.ad.remoteId = out.remoteId;
      settings.steps.ad = true;
      ctx.db.run(
        "INSERT INTO ads (id, organization_id, ad_group_id, platform, remote_id, name, status, sync_state, last_synced_at, created_at, updated_at) VALUES (?, ?, ?, 'google', ?, 'Anúncio responsivo de pesquisa', 'enabled', 'synced', ?, ?, ?)",
        [ctx.newId(), organizationId, id, out.remoteId, ctx.now(), ctx.now(), ctx.now()],
      );
    }
    ctx.db.run("UPDATE ad_groups SET status = 'enabled' WHERE id = ?", [id]);
    save({ syncState: 'synced', error: null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    save({ syncState: msg.startsWith('Resultado incerto') ? 'pending' : 'error', error: msg.slice(0, 600) });
    throw err;
  }
  return toAdGroup(getRow(ctx, organizationId, id));
}

// ---------------------------------------------------------------------------
// Anúncio completo a partir do link da página de destino
// ---------------------------------------------------------------------------

/**
 * Gera títulos, descrições, caminhos, palavras-chave e negativas a partir da
 * página de destino (já lida pelo leitor seguro) e do briefing, se houver.
 * Textos fora do limite do Google são descartados; quando o Planejador de
 * Palavras-chave está disponível, os volumes de busca reais são anexados.
 */
/**
 * Gera o anúncio a partir da página. Se a página não pôde ser lida (`fetchError`), usa o link,
 * o briefing e as palavras-semente — desde que haja briefing ou sementes para se basear.
 */
export async function generateSearchAdFromPage(
  ctx: AppContext,
  organizationId: string,
  campaignId: string,
  page: PageAnalysis,
  seeds: string[],
  fetchError?: string,
): Promise<SearchAdDraft> {
  const c = requireGoogleSearchCampaign(ctx, organizationId, campaignId);
  const brief = c.projectId ? getBrief(ctx, organizationId, c.projectId) : null;
  const project = c.projectId ? getProject(ctx, organizationId, c.projectId) : null;
  if (fetchError && !brief && seeds.length === 0) {
    throw new AppError(
      'EXTERNAL_API',
      `Não foi possível ler a página: ${fetchError} Informe algumas palavras-chave de partida (ou vincule a campanha a um projeto com briefing) para gerar mesmo assim.`,
    );
  }
  const p = aiProvider(ctx);
  const prompt = buildSearchAdFromPagePrompt({
    page: { url: page.finalUrl, title: page.title, description: page.description, headings: page.headings, textExcerpt: page.textExcerpt },
    brief: brief?.data ?? null,
    projectName: project?.name ?? null,
    seeds: seeds.slice(0, 20),
    unreadable: !!fetchError,
  });
  const { data, model } = await runAiJob(ctx, { organizationId, projectId: c.projectId, kind: 'search.adFromPage' }, p, () =>
    p.generateStructured({ ...prompt, schema: SearchAdFromPageOutput, maxTokens: 12_000, effort: 'medium' }),
  );

  const uniq = (list: string[]) => {
    const seen = new Set<string>();
    return list.filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()));
  };
  const allHeadlines = uniq(data.headlines.map((h) => h.trim()));
  const allDescriptions = uniq(data.descriptions.map((d) => d.trim()));
  const headlines = allHeadlines.filter((h) => validateText('google_rsa_headline', h).withinLimit).slice(0, 15);
  const descriptions = allDescriptions.filter((d) => validateText('google_rsa_description', d).withinLimit).slice(0, 4);
  const notes: string[] = fetchError
    ? [
        `A página não pôde ser lida (${fetchError}). Gerado por IA (${model}) a partir do link${brief ? ', do briefing do projeto' : ''}${seeds.length ? ' e das palavras de partida' : ''}. Confira se os textos correspondem ao que a página oferece.`,
      ]
    : [`Gerado por IA (${model}) a partir de ${new URL(page.finalUrl).hostname}${brief ? ' e do briefing do projeto' : ''}. Revise antes de publicar.`];
  const dropped = allHeadlines.length - headlines.length + (allDescriptions.length - descriptions.length);
  if (dropped > 0) notes.push(`${dropped} texto(s) acima do limite de caracteres foram descartados.`);
  if (headlines.length < 3 || descriptions.length < 2) throw new AppError('EXTERNAL_API', 'A IA não gerou textos suficientes dentro dos limites do Google. Tente gerar novamente.');

  const clean = (t: string) => t.replace(/[!@%,*=]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  const path = (t: string) => t.replace(/[\s/]+/g, '').slice(0, 15);
  const seenKw = new Set<string>();
  let keywords = data.keywords
    .map((k) => ({ ...k, text: clean(k.text) }))
    .filter((k) => k.text && k.text.split(' ').length <= 10 && !seenKw.has(k.text.toLowerCase()) && seenKw.add(k.text.toLowerCase()))
    .map((k) => ({
      text: k.text,
      source: 'ai' as const,
      avgMonthlySearches: null as number | null,
      competition: null as 'LOW' | 'MEDIUM' | 'HIGH' | null,
      lowBid: null as number | null,
      highBid: null as number | null,
      suggestedMatchType: k.matchType,
      note: k.intent,
    }));

  // Melhor esforço: volumes reais do Planejador do Google para as sugestões.
  try {
    const account = googleAccountFor(ctx, organizationId, c.advertisingAccountId);
    const client = googleAdsClient(ctx, organizationId);
    const ideas = await client.generateKeywordIdeas(account.remote_id, {
      seeds: keywords.slice(0, 10).map((k) => k.text),
      url: page.finalUrl,
      languageId: LANGUAGE_ID.pt,
      geoTargetId: GEO_ID.BR,
      limit: 200,
    });
    const byText = new Map(ideas.map((i) => [i.text.toLowerCase(), i]));
    const micros = (v: number | null) => (v === null ? null : Math.round(v / 10_000) / 100);
    keywords = keywords.map((k) => {
      const m = byText.get(k.text.toLowerCase());
      return m ? { ...k, avgMonthlySearches: m.avgMonthlySearches, competition: m.competition, lowBid: micros(m.lowBidMicros), highBid: micros(m.highBidMicros) } : k;
    });
    notes.push('Volumes de busca e lances: Planejador de Palavras-chave do Google (Brasil, português).');
  } catch {
    notes.push('Volumes de busca indisponíveis (Planejador do Google não acessível com o nível de acesso atual).');
  }

  recordAudit(ctx, { organizationId, action: 'ai.searchAdFromPage', entityType: 'campaign', entityId: campaignId, details: { model, host: new URL(page.finalUrl).hostname, headlines: headlines.length, keywords: keywords.length } });
  return {
    finalUrl: page.finalUrl,
    path1: path(data.path1),
    path2: data.path1 ? path(data.path2) : '',
    headlines,
    descriptions,
    keywords,
    negatives: [...new Set(data.negatives.map(clean).filter(Boolean))].slice(0, 30),
    strategy: data.strategy,
    notes,
  };
}
