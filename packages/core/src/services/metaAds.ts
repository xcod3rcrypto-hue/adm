import {
  AppError,
  META_GOALS_BY_OBJECTIVE,
  MetaAdSetInput,
  isoDay,
  type Asset,
  type Campaign,
  type MetaAdSet,
  type MetaAdView,
  type MetaAssetsOptions,
  type SyncState,
} from '@advertex/shared';
import type { AppContext } from '../context';
import { parseJson } from '../util';
import { getAsset } from './assets';
import { recordAudit } from './audit';
import { getBrief } from './briefs';
import { getCampaign } from './campaigns';
import { getCreative } from './creatives';
import { getAccount, metaAdsClient } from './integrations';
import { checkBudget, getPublishingLimits, runPlatformOperation, uploadAssetToPlatform } from './publishing';
import { getSetting, setSetting } from './settings';

/**
 * Meta: conjunto de anúncios (público, otimização, posicionamentos automáticos)
 * e anúncios (imagem + texto + título + botão + link), sempre PAUSADOS.
 * O envio acontece em etapas idempotentes — conjunto → imagem → criativo →
 * anúncio — e pode ser retomado de onde parou.
 */

type Input = ReturnType<typeof MetaAdSetInput.parse>;
interface SetSettings extends Omit<Input, 'ads' | 'name'> {
  kind: 'meta_adset';
}
interface AdSettings {
  assetId: string | null;
  headline: string;
  description: string;
  imageHash?: string;
  creativeRemoteId?: string;
}

interface SetRow {
  id: string;
  organization_id: string;
  campaign_id: string;
  name: string;
  remote_id: string | null;
  settings: string;
  sync_state: SyncState;
  last_error: string | null;
  updated_at: string;
}
interface AdRow {
  id: string;
  creative_id: string | null;
  creative_title: string | null;
  creative_body: string | null;
  name: string;
  remote_id: string | null;
  settings: string;
  last_error: string | null;
  sync_state: string;
}

const defaultsKey = (org: string) => `meta.adDefaults.${org}`;
interface Defaults {
  pageId: string | null;
  instagramUserId: string | null;
  pixelId: string | null;
  link: string;
  cta: Input['cta'];
  countries: string[];
}

function requireMetaCampaign(ctx: AppContext, organizationId: string, campaignId: string): Campaign {
  const c = getCampaign(ctx, organizationId, campaignId);
  if (c.platform !== 'meta') throw new AppError('VALIDATION', 'Conjuntos de anúncios da Meta só podem ser criados em campanhas da Meta.');
  if (c.objective && !META_GOALS_BY_OBJECTIVE[c.objective]) {
    throw new AppError('VALIDATION', 'O objetivo desta campanha (ex.: promoção de app) ainda não é suportado para criar anúncios pelo app.');
  }
  return c;
}

function getSetRow(ctx: AppContext, organizationId: string, id: string): SetRow {
  const r = ctx.db.get<SetRow>("SELECT * FROM ad_groups WHERE id = ? AND organization_id = ? AND platform = 'meta'", [id, organizationId]);
  if (!r) throw new AppError('NOT_FOUND', 'Conjunto de anúncios não encontrado.');
  return r;
}

function adRows(ctx: AppContext, adSetId: string): AdRow[] {
  return ctx.db.all<AdRow>(
    `SELECT a.id, a.creative_id, a.name, a.remote_id, a.settings, a.last_error, a.sync_state, c.title AS creative_title, c.body AS creative_body
     FROM ads a LEFT JOIN creatives c ON c.id = a.creative_id WHERE a.ad_group_id = ? ORDER BY a.created_at, a.rowid`,
    [adSetId],
  );
}

function missingFor(s: SetSettings, ads: MetaAdView[], campaign: Campaign): string[] {
  const m: string[] = [];
  if (!s.pageId) m.push('Página do Facebook');
  if (!s.link) m.push('Link de destino');
  if (s.optimizationGoal === 'OFFSITE_CONVERSIONS' && !s.pixelId) m.push('Pixel (para otimizar por conversões)');
  if (!campaign.dailyBudget && !s.dailyBudget) m.push('Orçamento diário do conjunto (a campanha não tem orçamento próprio)');
  if (ads.length === 0) m.push('Ao menos um anúncio');
  if (ads.some((a) => !a.assetId)) m.push('Imagem em todos os anúncios');
  if (!campaign.remoteId) m.push('Publicar a campanha na Meta');
  return m;
}

function toView(ctx: AppContext, row: SetRow): MetaAdSet {
  const s = parseJson<SetSettings>(row.settings, {} as SetSettings);
  const campaign = getCampaign(ctx, row.organization_id, row.campaign_id);
  const ads: MetaAdView[] = adRows(ctx, row.id).map((a) => {
    const st = parseJson<AdSettings>(a.settings, { assetId: null, headline: '', description: '' });
    return {
      id: a.id,
      creativeId: a.creative_id,
      creativeTitle: a.creative_title,
      body: a.creative_body ?? '',
      assetId: st.assetId,
      headline: st.headline,
      description: st.description,
      remoteId: a.remote_id,
      status: a.remote_id ? 'published' : st.creativeRemoteId ? 'creative' : st.imageHash ? 'image' : 'local',
      lastError: a.last_error,
    };
  });
  return {
    id: row.id,
    campaignId: row.campaign_id,
    name: row.name,
    optimizationGoal: s.optimizationGoal,
    pixelId: s.pixelId,
    conversionEvent: s.conversionEvent,
    countries: s.countries,
    ageMin: s.ageMin,
    ageMax: s.ageMax,
    gender: s.gender,
    advantageAudience: s.advantageAudience,
    dailyBudget: s.dailyBudget,
    pageId: s.pageId,
    instagramUserId: s.instagramUserId,
    link: s.link,
    cta: s.cta,
    remoteId: row.remote_id,
    syncState: row.sync_state,
    lastError: row.last_error,
    ads,
    missing: missingFor(s, ads, campaign).filter((x) => !(row.remote_id && x === 'Publicar a campanha na Meta')),
    updatedAt: row.updated_at,
  };
}

export function listMetaAdSets(ctx: AppContext, organizationId: string, campaignId: string): MetaAdSet[] {
  requireMetaCampaign(ctx, organizationId, campaignId);
  return ctx.db
    .all<SetRow>("SELECT * FROM ad_groups WHERE organization_id = ? AND campaign_id = ? AND platform = 'meta' ORDER BY created_at", [organizationId, campaignId])
    .map((r) => toView(ctx, r));
}

export function getMetaAdDefaults(ctx: AppContext, organizationId: string): Defaults {
  return getSetting<Defaults>(ctx, defaultsKey(organizationId), { pageId: null, instagramUserId: null, pixelId: null, link: '', cta: 'SHOP_NOW', countries: ['BR'] });
}

function checkImage(ctx: AppContext, organizationId: string, assetId: string): Asset {
  const a = getAsset(ctx, organizationId, assetId);
  if (!a.mimeType.startsWith('image/')) throw new AppError('VALIDATION', `"${a.fileName}" não é uma imagem.`);
  return a;
}

/** Cria ou atualiza o rascunho. Depois de enviado, só é possível acrescentar anúncios novos. */
export function saveMetaAdSet(ctx: AppContext, organizationId: string, campaignId: string, id: string | null, raw: unknown): MetaAdSet {
  const c = requireMetaCampaign(ctx, organizationId, campaignId);
  const d = MetaAdSetInput.parse(raw);
  const goals = META_GOALS_BY_OBJECTIVE[c.objective] ?? [];
  if (goals.length && !goals.includes(d.optimizationGoal)) {
    throw new AppError('VALIDATION', 'Meta de otimização incompatível com o objetivo da campanha.', { fieldErrors: { optimizationGoal: ['Escolha outra meta de otimização'] } });
  }
  if (d.dailyBudget !== null) {
    const problem = checkBudget(getPublishingLimits(ctx, organizationId), d.dailyBudget, c.currency, null);
    if (problem) throw new AppError('FORBIDDEN', problem);
  }
  for (const ad of d.ads) {
    const cr = getCreative(ctx, organizationId, ad.creativeId);
    if (!cr.body.trim()) throw new AppError('VALIDATION', `O criativo "${cr.title}" não tem texto.`);
    if (ad.assetId) checkImage(ctx, organizationId, ad.assetId);
  }

  const now = ctx.now();
  const existing = id ? getSetRow(ctx, organizationId, id) : null;
  if (existing && existing.campaign_id !== campaignId) throw new AppError('NOT_FOUND', 'Conjunto de anúncios não encontrado.');
  const { ads, name, ...rest } = d;
  const settings: SetSettings = existing?.remote_id ? parseJson<SetSettings>(existing.settings, {} as SetSettings) : { kind: 'meta_adset', ...rest };
  if (existing?.remote_id) {
    // Público, otimização e link já estão na Meta: mudanças são feitas lá (ou num conjunto novo).
    const { kind: _k, ...stored } = settings;
    if (name !== existing.name || JSON.stringify(stored) !== JSON.stringify(rest)) {
      throw new AppError('CONFLICT', 'Este conjunto já foi enviado à Meta: público, otimização e link não mudam mais pelo app. Você ainda pode acrescentar anúncios.');
    }
  }

  return ctx.db.transaction(() => {
    const setId = existing?.id ?? ctx.newId();
    if (existing) {
      ctx.db.run('UPDATE ad_groups SET name = ?, settings = ?, updated_at = ? WHERE id = ?', [name, JSON.stringify(settings), now, setId]);
    } else {
      ctx.db.run(
        "INSERT INTO ad_groups (id, organization_id, campaign_id, platform, name, status, settings, sync_state, created_at, updated_at) VALUES (?, ?, ?, 'meta', ?, 'draft', ?, 'local_only', ?, ?)",
        [setId, organizationId, campaignId, name, JSON.stringify(settings), now, now],
      );
    }
    const current = adRows(ctx, setId);
    const keepIds = new Set(ads.map((a) => a.id).filter(Boolean));
    for (const old of current) {
      if (keepIds.has(old.id)) continue;
      if (old.remote_id || parseJson<AdSettings>(old.settings, {} as AdSettings).creativeRemoteId) {
        throw new AppError('CONFLICT', `O anúncio "${old.name}" já foi enviado à Meta e não pode ser removido pelo app.`);
      }
      ctx.db.run('DELETE FROM ads WHERE id = ?', [old.id]);
    }
    ads.forEach((ad, i) => {
      const cr = getCreative(ctx, organizationId, ad.creativeId);
      const adName = `${name} · ${String(i + 1).padStart(2, '0')} · ${cr.title}`.slice(0, 250);
      const prev = ad.id ? current.find((x) => x.id === ad.id) : undefined;
      if (prev) {
        const st = parseJson<AdSettings>(prev.settings, {} as AdSettings);
        if (prev.remote_id || st.creativeRemoteId) return; // já enviado: congelado
        const next: AdSettings = { assetId: ad.assetId, headline: ad.headline, description: ad.description, imageHash: st.assetId === ad.assetId ? st.imageHash : undefined };
        ctx.db.run('UPDATE ads SET creative_id = ?, name = ?, settings = ?, updated_at = ? WHERE id = ?', [ad.creativeId, adName, JSON.stringify(next), now, prev.id]);
      } else {
        ctx.db.run(
          "INSERT INTO ads (id, organization_id, ad_group_id, creative_id, platform, name, status, sync_state, settings, created_at, updated_at) VALUES (?, ?, ?, ?, 'meta', ?, 'draft', 'local_only', ?, ?, ?)",
          [ctx.newId(), organizationId, setId, ad.creativeId, adName, JSON.stringify({ assetId: ad.assetId, headline: ad.headline, description: ad.description } satisfies AdSettings), now, now],
        );
      }
    });
    setSetting(ctx, defaultsKey(organizationId), {
      pageId: settings.pageId,
      instagramUserId: settings.instagramUserId,
      pixelId: settings.pixelId,
      link: settings.link,
      cta: settings.cta,
      countries: settings.countries,
    } satisfies Defaults);
    recordAudit(ctx, { organizationId, action: existing ? 'meta.adset.update' : 'meta.adset.create', entityType: 'ad_group', entityId: setId, details: { ads: ads.length } });
    return toView(ctx, getSetRow(ctx, organizationId, setId));
  });
}

export function deleteMetaAdSet(ctx: AppContext, organizationId: string, id: string): void {
  const row = getSetRow(ctx, organizationId, id);
  if (row.remote_id) throw new AppError('CONFLICT', 'Este conjunto já existe na Meta; remova-o pelo Gerenciador de Anúncios.');
  ctx.db.run('DELETE FROM ad_groups WHERE id = ?', [id]);
  recordAudit(ctx, { organizationId, action: 'meta.adset.delete', entityType: 'ad_group', entityId: id });
}

/** Público: países, idade, gênero e Público Advantage+ (posicionamentos sempre automáticos). */
export function buildTargeting(s: Pick<SetSettings, 'countries' | 'ageMin' | 'ageMax' | 'gender' | 'advantageAudience'>): Record<string, unknown> {
  const t: Record<string, unknown> = { geo_locations: { countries: s.countries } };
  if (s.advantageAudience) {
    // Com o Público Advantage+, a idade máxima fica em 65 e a mínima vale como controle (até 25).
    t.age_min = Math.min(s.ageMin, 25);
    t.targeting_automation = { advantage_audience: 1 };
  } else {
    t.age_min = s.ageMin;
    t.age_max = s.ageMax;
    t.targeting_automation = { advantage_audience: 0 };
  }
  if (s.gender !== 'all') t.genders = [s.gender === 'male' ? 1 : 2];
  return t;
}

/** Envia (ou retoma) o conjunto e os anúncios na Meta — tudo PAUSADO. */
export async function pushMetaAdSet(ctx: AppContext, organizationId: string, id: string): Promise<MetaAdSet> {
  const row = getSetRow(ctx, organizationId, id);
  const view = toView(ctx, row);
  const c = requireMetaCampaign(ctx, organizationId, row.campaign_id);
  if (view.missing.length) throw new AppError('VALIDATION', `Antes de enviar, complete: ${view.missing.join('; ')}.`);
  const account = getAccount(ctx, organizationId, 'meta', c.advertisingAccountId!);
  const client = metaAdsClient(ctx, organizationId);
  const s = parseJson<SetSettings>(row.settings, {} as SetSettings);
  const base = { organizationId, campaignId: c.id, platform: 'meta' as const };
  let remoteId = row.remote_id;
  ctx.db.run("UPDATE ad_groups SET sync_state = 'pending', last_error = NULL WHERE id = ?", [id]);

  try {
    if (!remoteId) {
      const conversions = s.optimizationGoal === 'OFFSITE_CONVERSIONS';
      const out = await runPlatformOperation(
        ctx,
        { ...base, operation: 'createAdSet', idempotencyKey: `metaAdSet:${id}`, request: { campaign: c.remoteId, name: row.name, goal: s.optimizationGoal } },
        () =>
          client.createAdSet(account.remote_id, {
            name: row.name,
            campaignId: c.remoteId!,
            optimizationGoal: s.optimizationGoal,
            destinationType: ['OFFSITE_CONVERSIONS', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS'].includes(s.optimizationGoal) ? 'WEBSITE' : null,
            targeting: buildTargeting(s),
            promotedObject: conversions && s.pixelId ? { pixel_id: s.pixelId, custom_event_type: s.conversionEvent } : null,
            dailyBudget: c.dailyBudget ? null : s.dailyBudget,
            currency: c.currency,
          }),
        () => client.findAdSetByName(c.remoteId!, row.name),
      );
      remoteId = out.remoteId;
      ctx.db.run('UPDATE ad_groups SET remote_id = ?, updated_at = ? WHERE id = ?', [remoteId, ctx.now(), id]);
    }

    for (const ad of adRows(ctx, id)) {
      if (ad.remote_id) continue;
      const st = parseJson<AdSettings>(ad.settings, { assetId: null, headline: '', description: '' });
      const saveAd = (patch: Partial<AdSettings>, extra: { remoteId?: string | null; error?: string | null } = {}) => {
        Object.assign(st, patch);
        ctx.db.run('UPDATE ads SET settings = ?, remote_id = COALESCE(?, remote_id), last_error = ?, sync_state = ?, last_synced_at = ?, updated_at = ? WHERE id = ?', [
          JSON.stringify(st),
          extra.remoteId ?? null,
          extra.error ?? null,
          extra.remoteId ? 'synced' : extra.error ? 'error' : 'pending',
          ctx.now(),
          ctx.now(),
          ad.id,
        ]);
      };
      try {
        if (!ad.creative_id) throw new AppError('VALIDATION', 'O criativo deste anúncio foi excluído.');
        const cr = getCreative(ctx, organizationId, ad.creative_id);
        if (!st.imageHash) {
          const up = await uploadAssetToPlatform(ctx, organizationId, st.assetId!, account.id);
          saveAd({ imageHash: up.remoteId });
        }
        if (!st.creativeRemoteId) {
          const creativeName = `${ad.name} · criativo`;
          const out = await runPlatformOperation(
            ctx,
            { ...base, operation: 'createAdCreative', idempotencyKey: `metaCreative:${ad.id}`, request: { name: creativeName, page: s.pageId } },
            () =>
              client.createAdCreative(account.remote_id, {
                name: creativeName,
                pageId: s.pageId!,
                instagramUserId: s.instagramUserId,
                imageHash: st.imageHash!,
                link: s.link,
                message: cr.body,
                headline: st.headline,
                description: st.description,
                cta: s.cta,
              }),
            () => client.findAdCreativeByName(account.remote_id, creativeName),
          );
          saveAd({ creativeRemoteId: out.remoteId! });
        }
        const out = await runPlatformOperation(
          ctx,
          { ...base, operation: 'createAd', idempotencyKey: `metaAd:${ad.id}`, request: { adSet: remoteId, name: ad.name } },
          () => client.createAd(account.remote_id, { name: ad.name, adSetId: remoteId!, creativeId: st.creativeRemoteId! }),
          () => client.findAdByName(remoteId!, ad.name),
        );
        saveAd({}, { remoteId: out.remoteId });
      } catch (err) {
        saveAd({}, { error: err instanceof Error ? err.message : String(err) });
        throw err;
      }
    }
    ctx.db.run("UPDATE ad_groups SET sync_state = 'synced', last_error = NULL, last_synced_at = ?, updated_at = ? WHERE id = ?", [ctx.now(), ctx.now(), id]);
    recordAudit(ctx, { organizationId, action: 'meta.adset.push', entityType: 'ad_group', entityId: id, details: { remoteId, ads: view.ads.length } });
  } catch (err) {
    ctx.db.run("UPDATE ad_groups SET sync_state = 'error', last_error = ?, updated_at = ? WHERE id = ?", [err instanceof Error ? err.message.slice(0, 1000) : String(err), ctx.now(), id]);
    throw err;
  }
  return toView(ctx, getSetRow(ctx, organizationId, id));
}

/** Páginas, contas do Instagram e pixels disponíveis na conta (melhor esforço em cada um). */
export async function metaAssetsOptions(ctx: AppContext, organizationId: string, campaignId: string): Promise<MetaAssetsOptions> {
  const c = requireMetaCampaign(ctx, organizationId, campaignId);
  if (!c.advertisingAccountId) return { pages: [], instagram: [], pixels: [], notes: ['Vincule a campanha a uma conta de anúncios (publique-a) para listar páginas e pixels.'] };
  const account = getAccount(ctx, organizationId, 'meta', c.advertisingAccountId);
  const client = metaAdsClient(ctx, organizationId);
  const notes: string[] = [];
  const safe = async <T,>(label: string, fn: () => Promise<T[]>): Promise<T[]> => {
    try {
      return await fn();
    } catch (err) {
      notes.push(`${label}: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
  };
  const [pages, instagram, pixels] = await Promise.all([
    safe('Páginas', () => client.listPromotePages(account.remote_id)),
    safe('Instagram', () => client.listInstagramAccounts(account.remote_id)),
    safe('Pixels', () => client.listPixels(account.remote_id)),
  ]);
  return { pages, instagram, pixels, notes };
}

/** Imagem preferida de um criativo para o feed (4:5, 1:1, depois o que houver). */
function preferredImage(ctx: AppContext, organizationId: string, assetIds: string[]): string | null {
  const imgs = assetIds
    .map((id) => {
      try {
        return getAsset(ctx, organizationId, id);
      } catch {
        return null;
      }
    })
    .filter((a): a is Asset => !!a && a.mimeType.startsWith('image/'));
  const rank = (a: Asset) => (a.tags.includes('4:5') ? 0 : a.tags.includes('1:1') ? 1 : a.tags.includes('9:16') ? 3 : 2);
  return imgs.sort((a, b) => rank(a) - rank(b))[0]?.id ?? null;
}

/** Monta um conjunto (rascunho) com os criativos da Fábrica, usando as últimas escolhas da organização. */
export function createMetaAdSetFromCreatives(ctx: AppContext, organizationId: string, campaignId: string, creativeIds: string[]): MetaAdSet {
  const c = requireMetaCampaign(ctx, organizationId, campaignId);
  if (creativeIds.length === 0) throw new AppError('VALIDATION', 'Selecione ao menos um criativo.');
  const d = getMetaAdDefaults(ctx, organizationId);
  const projectLink = c.projectId ? (getBrief(ctx, organizationId, c.projectId)?.data.websiteUrl ?? '') : '';
  const goals = META_GOALS_BY_OBJECTIVE[c.objective] ?? ['LANDING_PAGE_VIEWS'];
  const goal = d.pixelId && goals.includes('OFFSITE_CONVERSIONS') ? 'OFFSITE_CONVERSIONS' : goals.includes('LANDING_PAGE_VIEWS') ? 'LANDING_PAGE_VIEWS' : goals[0]!;
  const ads = creativeIds.slice(0, 20).map((id) => {
    const cr = getCreative(ctx, organizationId, id);
    return { creativeId: id, assetId: preferredImage(ctx, organizationId, cr.assetIds), headline: cr.title.replace(/^Fábrica · /, '').slice(0, 40), description: '' };
  });
  return saveMetaAdSet(ctx, organizationId, campaignId, null, {
    name: `Fábrica · ${isoDay(0)} · ${ads.length} anúncio(s)`,
    optimizationGoal: goal,
    pixelId: goal === 'OFFSITE_CONVERSIONS' ? d.pixelId : null,
    countries: d.countries,
    pageId: d.pageId,
    instagramUserId: d.instagramUserId,
    link: d.link || (/^https:\/\//.test(projectLink) ? projectLink : ''),
    cta: d.cta,
    ads,
  });
}
