import { readFileSync } from 'node:fs';
import { AppError, PublishingLimits, formatCurrency, type Campaign, type Platform, type PlatformOperation, type PlatformOperationStatus, type PublishCheck } from '@advertex/shared';
import { CircuitOpenError, PlatformApiError } from '@advertex/advertising-core';
import type { AppContext } from '../context';
import { bool, parseJson, requireOrg } from '../util';
import { recordAudit } from './audit';
import { assetFilePath, getAsset } from './assets';
import { getCampaign } from './campaigns';
import { platformWriter } from './integrations';
import { getSetting, setSetting } from './settings';

/**
 * Publicação controlada: toda escrita nas plataformas passa por aqui.
 * - Validação prévia (checklist) e confirmação explícita na interface.
 * - Limites de orçamento por organização.
 * - Idempotência: cada operação tem uma chave única; operações com resultado
 *   incerto são verificadas no estado remoto antes de qualquer repetição.
 * - Nada é marcado como publicado sem a resposta da plataforma.
 * - Toda tentativa fica registrada (platform_operations + auditoria).
 */

const limitsKey = (organizationId: string) => `publishing.limits.${organizationId}`;

export function getPublishingLimits(ctx: AppContext, organizationId: string): PublishingLimits {
  requireOrg(ctx, organizationId);
  return PublishingLimits.parse(getSetting<unknown>(ctx, limitsKey(organizationId), {}));
}

export function savePublishingLimits(ctx: AppContext, organizationId: string, raw: unknown): PublishingLimits {
  requireOrg(ctx, organizationId);
  const limits = PublishingLimits.parse(raw);
  setSetting(ctx, limitsKey(organizationId), limits);
  recordAudit(ctx, { organizationId, action: 'publishing.limits.save', entityType: 'settings', details: limits });
  return limits;
}

interface AccountRow {
  id: string;
  platform: Platform;
  remote_id: string;
  name: string;
  currency: string | null;
}

function getAccount(ctx: AppContext, organizationId: string, accountId: string): AccountRow {
  const a = ctx.db.get<AccountRow>('SELECT id, platform, remote_id, name, currency FROM advertising_accounts WHERE id = ? AND organization_id = ?', [accountId, organizationId]);
  if (!a) throw new AppError('NOT_FOUND', 'Conta de anúncios não encontrada. Sincronize as contas em Integrações.');
  return a;
}

function checkBudget(limits: PublishingLimits, amount: number, currency: string, current: number | null): string | null {
  if (limits.maxDailyBudget !== null && amount > limits.maxDailyBudget) {
    return `O orçamento de ${formatCurrency(amount, currency)} excede o limite da organização (${formatCurrency(limits.maxDailyBudget, currency)}). Ajuste o limite em Configurações → Limites de publicação.`;
  }
  if (current !== null && current > 0 && limits.maxBudgetIncreasePercent !== null) {
    const increase = ((amount - current) / current) * 100;
    if (increase > limits.maxBudgetIncreasePercent) {
      return `Aumento de ${increase.toFixed(0)}% excede o máximo de ${limits.maxBudgetIncreasePercent}% por alteração.`;
    }
  }
  return null;
}

/** Checklist sem chamadas externas: o que precisa estar certo antes de publicar. */
export function preflightPublish(ctx: AppContext, organizationId: string, campaignId: string, accountId: string | null): PublishCheck {
  const org = requireOrg(ctx, organizationId);
  const c = getCampaign(ctx, organizationId, campaignId);
  const items: PublishCheck['items'] = [];
  const add = (label: string, ok: boolean, detail: string) => items.push({ label, ok, detail });

  add('Organização real', !bool(org.is_demo), bool(org.is_demo) ? 'A organização de demonstração não publica em contas reais.' : 'Dados reais, separados da demonstração.');
  add('Ainda não publicada', !c.remoteId, c.remoteId ? `Já existe na plataforma (ID ${c.remoteId}).` : 'Será criada uma nova campanha.');
  // Informativo: uma nova tentativa sempre verifica o estado remoto antes de criar.
  add('Operação anterior', true, c.syncState === 'pending' ? 'Há uma publicação com resultado incerto: ao publicar, o app primeiro verifica se ela já existe na conta.' : 'Nenhuma operação em aberto.');

  const account = accountId ? ctx.db.get<AccountRow>('SELECT id, platform, remote_id, name, currency FROM advertising_accounts WHERE id = ? AND organization_id = ?', [accountId, organizationId]) : undefined;
  add('Conta de anúncios', !!account && account.platform === c.platform, !account ? 'Selecione uma conta sincronizada da plataforma.' : account.platform !== c.platform ? 'A conta é de outra plataforma.' : `${account.name} (${account.remote_id})`);
  if (account?.currency) {
    add('Moeda compatível', account.currency === c.currency, account.currency === c.currency ? `Campanha e conta em ${c.currency}.` : `A campanha está em ${c.currency} e a conta em ${account.currency}. Ajuste a moeda do rascunho.`);
  }
  add('Orçamento diário definido', c.dailyBudget !== null && c.dailyBudget > 0, c.dailyBudget ? formatCurrency(c.dailyBudget, c.currency) : 'Informe o orçamento diário no rascunho.');
  if (c.dailyBudget) {
    const problem = checkBudget(getPublishingLimits(ctx, organizationId), c.dailyBudget, c.currency, null);
    add('Dentro do limite de orçamento', problem === null, problem ?? 'Abaixo do limite configurado.');
  }
  const objectiveOk = c.platform === 'meta' ? /^OUTCOME_[A-Z_]+$/.test(c.objective) : c.objective === 'SEARCH';
  add(
    'Tipo/objetivo suportado',
    objectiveOk,
    objectiveOk ? 'Suportado para criação pelo app.' : c.platform === 'google' ? 'Nesta versão, apenas campanhas de Pesquisa podem ser criadas pelo app.' : 'Objetivo inválido para a Meta.',
  );
  add('Criada pausada', true, 'A campanha é criada PAUSADA. Ativar é uma ação separada, após revisar conjuntos/grupos e anúncios na plataforma.');
  return { ok: items.every((i) => i.ok), items };
}

interface OperationRow {
  id: string;
  campaign_id: string | null;
  campaign_name: string | null;
  platform: Platform;
  operation: string;
  status: PlatformOperationStatus;
  request: string;
  remote_id: string | null;
  error: string | null;
  created_at: string;
  finished_at: string | null;
}

export function listPlatformOperations(ctx: AppContext, organizationId: string, campaignId: string | null = null, limit = 100): PlatformOperation[] {
  requireOrg(ctx, organizationId);
  const params: Array<string | number> = [organizationId];
  let where = 'o.organization_id = ?';
  if (campaignId) {
    where += ' AND o.campaign_id = ?';
    params.push(campaignId);
  }
  params.push(limit);
  return ctx.db
    .all<OperationRow>(`SELECT o.*, c.name AS campaign_name FROM platform_operations o LEFT JOIN campaigns c ON c.id = o.campaign_id WHERE ${where} ORDER BY o.created_at DESC, o.rowid DESC LIMIT ?`, params)
    .map((r) => ({
      id: r.id,
      campaignId: r.campaign_id,
      campaignName: r.campaign_name,
      platform: r.platform,
      operation: r.operation,
      status: r.status,
      request: parseJson<Record<string, unknown>>(r.request, {}),
      remoteId: r.remote_id,
      error: r.error,
      createdAt: r.created_at,
      finishedAt: r.finished_at,
    }));
}

/** Falha definitiva (a plataforma recusou) x resultado incerto (rede, timeout, 5xx). */
function isDefiniteFailure(err: unknown): boolean {
  if (err instanceof CircuitOpenError) return true; // nada foi enviado
  if (err instanceof PlatformApiError) return err.status < 500;
  return err instanceof Error && /inválid/i.test(err.message);
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export interface OperationSpec {
  organizationId: string;
  campaignId: string | null;
  platform: Platform;
  operation: string;
  idempotencyKey: string;
  request: Record<string, unknown>;
  actor?: 'user' | 'automation';
}

export interface OperationOutcome {
  operationId: string;
  remoteId: string | null;
  replayed: boolean;
}

/**
 * Executa uma escrita com idempotência. Se a mesma chave já teve sucesso,
 * devolve o resultado gravado sem chamar a plataforma. Se ficou incerta e há
 * `verify`, consulta o estado remoto antes de tentar de novo.
 */
export async function runPlatformOperation(
  ctx: AppContext,
  spec: OperationSpec,
  execute: () => Promise<{ remoteId: string | null }>,
  verify?: () => Promise<string | null>,
): Promise<OperationOutcome> {
  const existing = ctx.db.get<{ id: string; status: PlatformOperationStatus; remote_id: string | null }>(
    'SELECT id, status, remote_id FROM platform_operations WHERE organization_id = ? AND idempotency_key = ?',
    [spec.organizationId, spec.idempotencyKey],
  );
  if (existing?.status === 'succeeded') return { operationId: existing.id, remoteId: existing.remote_id, replayed: true };

  const finish = (id: string, status: PlatformOperationStatus, extra: { remoteId?: string | null; error?: string | null; response?: unknown }) =>
    ctx.db.run('UPDATE platform_operations SET status = ?, remote_id = COALESCE(?, remote_id), error = ?, response = ?, finished_at = ? WHERE id = ?', [
      status,
      extra.remoteId ?? null,
      extra.error ?? null,
      extra.response === undefined ? null : JSON.stringify(extra.response),
      ctx.now(),
      id,
    ]);

  let opId: string;
  if (existing) {
    opId = existing.id;
    if ((existing.status === 'unknown' || existing.status === 'pending') && verify) {
      const found = await verify();
      if (found) {
        finish(opId, 'succeeded', { remoteId: found, response: { verifiedRemotely: true } });
        recordAudit(ctx, { organizationId: spec.organizationId, action: `platform.${spec.operation}.verified`, entityType: spec.campaignId ? 'campaign' : 'asset', entityId: spec.campaignId, details: { remoteId: found } });
        return { operationId: opId, remoteId: found, replayed: true };
      }
    }
    ctx.db.run("UPDATE platform_operations SET status = 'pending', error = NULL, request = ?, finished_at = NULL WHERE id = ?", [JSON.stringify(spec.request), opId]);
  } else {
    opId = ctx.newId();
    ctx.db.run(
      `INSERT INTO platform_operations (id, organization_id, campaign_id, platform, operation, idempotency_key, status, request, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [opId, spec.organizationId, spec.campaignId, spec.platform, spec.operation, spec.idempotencyKey, JSON.stringify(spec.request), ctx.now()],
    );
  }

  try {
    const r = await execute();
    finish(opId, 'succeeded', { remoteId: r.remoteId, response: { ok: true } });
    recordAudit(ctx, {
      organizationId: spec.organizationId,
      action: `platform.${spec.operation}`,
      entityType: spec.campaignId ? 'campaign' : 'asset',
      entityId: spec.campaignId,
      details: { ...spec.request, platform: spec.platform, remoteId: r.remoteId, actor: spec.actor ?? 'user' },
    });
    return { operationId: opId, remoteId: r.remoteId, replayed: false };
  } catch (err) {
    const definite = isDefiniteFailure(err);
    finish(opId, definite ? 'failed' : 'unknown', { error: message(err) });
    recordAudit(ctx, {
      organizationId: spec.organizationId,
      action: `platform.${spec.operation}`,
      entityType: spec.campaignId ? 'campaign' : 'asset',
      entityId: spec.campaignId,
      outcome: 'failure',
      details: { ...spec.request, platform: spec.platform, error: message(err), uncertain: !definite, actor: spec.actor ?? 'user' },
    });
    if (definite) throw new AppError('EXTERNAL_API', message(err), { cause: err });
    throw new AppError(
      'EXTERNAL_API',
      `Resultado incerto (${message(err)}). A operação pode ter sido aplicada. Confira na plataforma; ao tentar novamente, o app verifica o estado remoto antes de repetir.`,
      { cause: err },
    );
  }
}

/** Cria a campanha na plataforma (sempre pausada) a partir de um rascunho local. */
export async function publishCampaign(ctx: AppContext, organizationId: string, campaignId: string, accountId: string): Promise<Campaign> {
  const check = preflightPublish(ctx, organizationId, campaignId, accountId);
  const failed = check.items.filter((i) => !i.ok);
  if (failed.length > 0) throw new AppError('VALIDATION', `Publicação bloqueada: ${failed.map((f) => `${f.label} — ${f.detail}`).join(' ')}`);
  const c = getCampaign(ctx, organizationId, campaignId);
  const account = getAccount(ctx, organizationId, accountId);
  const writer = platformWriter(ctx, organizationId, c.platform);
  const spec = { name: c.name, objective: c.objective, dailyBudget: c.dailyBudget!, currency: c.currency };

  ctx.db.run("UPDATE campaigns SET sync_state = 'pending', last_error = NULL, advertising_account_id = ?, updated_at = ? WHERE id = ?", [account.id, ctx.now(), c.id]);
  try {
    const out = await runPlatformOperation(
      ctx,
      {
        organizationId,
        campaignId: c.id,
        platform: c.platform,
        operation: 'createCampaign',
        // Uma criação por rascunho: repetir reaproveita a mesma chave e verifica antes.
        idempotencyKey: `createCampaign:${c.id}`,
        request: { account: account.remote_id, ...spec },
      },
      () => writer.createCampaign(account.remote_id, spec),
      () => writer.findCampaignByName(account.remote_id, c.name),
    );
    ctx.db.run(
      "UPDATE campaigns SET remote_id = ?, status = 'paused', sync_state = 'synced', last_synced_at = ?, last_error = NULL, updated_at = ? WHERE id = ? AND organization_id = ?",
      [out.remoteId, ctx.now(), ctx.now(), c.id, organizationId],
    );
  } catch (err) {
    const uncertain = err instanceof AppError && err.message.startsWith('Resultado incerto');
    ctx.db.run('UPDATE campaigns SET sync_state = ?, last_error = ?, updated_at = ? WHERE id = ? AND organization_id = ?', [
      uncertain ? 'pending' : 'error',
      message(err).slice(0, 500),
      ctx.now(),
      c.id,
      organizationId,
    ]);
    throw err;
  }
  return getCampaign(ctx, organizationId, campaignId);
}

function requireRemote(ctx: AppContext, organizationId: string, campaignId: string): { c: Campaign; account: AccountRow } {
  const c = getCampaign(ctx, organizationId, campaignId);
  if (!c.remoteId || !c.advertisingAccountId) throw new AppError('VALIDATION', 'A campanha ainda não existe na plataforma. Publique o rascunho ou sincronize as campanhas da conta.');
  return { c, account: getAccount(ctx, organizationId, c.advertisingAccountId) };
}

export async function setCampaignRemoteStatus(
  ctx: AppContext,
  organizationId: string,
  campaignId: string,
  status: 'active' | 'paused',
  opts: { idempotencyKey?: string; actor?: 'user' | 'automation' } = {},
): Promise<Campaign> {
  const { c, account } = requireRemote(ctx, organizationId, campaignId);
  const writer = platformWriter(ctx, organizationId, c.platform);
  await runPlatformOperation(
    ctx,
    {
      organizationId,
      campaignId: c.id,
      platform: c.platform,
      operation: status === 'active' ? 'resumeCampaign' : 'pauseCampaign',
      idempotencyKey: opts.idempotencyKey ?? `status:${c.id}:${ctx.newId()}`,
      request: { remoteId: c.remoteId, from: c.status, to: status },
      actor: opts.actor,
    },
    async () => {
      await writer.setCampaignStatus(account.remote_id, c.remoteId!, status);
      return { remoteId: c.remoteId };
    },
  );
  ctx.db.run('UPDATE campaigns SET status = ?, last_synced_at = ?, last_error = NULL, updated_at = ? WHERE id = ? AND organization_id = ?', [status, ctx.now(), ctx.now(), c.id, organizationId]);
  return getCampaign(ctx, organizationId, campaignId);
}

export async function updateCampaignRemoteBudget(
  ctx: AppContext,
  organizationId: string,
  campaignId: string,
  amount: number,
  opts: { idempotencyKey?: string; actor?: 'user' | 'automation' } = {},
): Promise<Campaign> {
  const { c, account } = requireRemote(ctx, organizationId, campaignId);
  if (!Number.isFinite(amount) || amount <= 0) throw new AppError('VALIDATION', 'Informe um orçamento diário positivo.');
  const rounded = Math.round(amount * 100) / 100;
  const problem = checkBudget(getPublishingLimits(ctx, organizationId), rounded, c.currency, c.dailyBudget);
  if (problem) throw new AppError('FORBIDDEN', problem);
  const writer = platformWriter(ctx, organizationId, c.platform);
  await runPlatformOperation(
    ctx,
    {
      organizationId,
      campaignId: c.id,
      platform: c.platform,
      operation: 'updateBudget',
      idempotencyKey: opts.idempotencyKey ?? `budget:${c.id}:${ctx.newId()}`,
      request: { remoteId: c.remoteId, from: c.dailyBudget, to: rounded, currency: c.currency },
      actor: opts.actor,
    },
    async () => {
      await writer.updateDailyBudget(account.remote_id, c.remoteId!, rounded, c.currency);
      return { remoteId: c.remoteId };
    },
  );
  ctx.db.run('UPDATE campaigns SET daily_budget = ?, last_synced_at = ?, last_error = NULL, updated_at = ? WHERE id = ? AND organization_id = ?', [rounded, ctx.now(), ctx.now(), c.id, organizationId]);
  return getCampaign(ctx, organizationId, campaignId);
}

/** Envia uma imagem da biblioteca para a conta de anúncios (Meta: hash; Google: ativo). */
export async function uploadAssetToPlatform(ctx: AppContext, organizationId: string, assetId: string, accountId: string): Promise<{ remoteId: string }> {
  const asset = getAsset(ctx, organizationId, assetId);
  const account = getAccount(ctx, organizationId, accountId);
  if (!asset.mimeType.startsWith('image/')) throw new AppError('VALIDATION', 'Somente imagens podem ser enviadas nesta versão.');
  const file = assetFilePath(ctx, organizationId, assetId);
  const writer = platformWriter(ctx, organizationId, account.platform);
  const out = await runPlatformOperation(
    ctx,
    {
      organizationId,
      campaignId: null,
      platform: account.platform,
      operation: 'uploadImage',
      idempotencyKey: `uploadImage:${assetId}:${account.id}`,
      request: { assetId, account: account.remote_id, fileName: file.fileName },
    },
    async () => writer.uploadImage(account.remote_id, file.fileName, new Uint8Array(readFileSync(file.path))),
  );
  return { remoteId: out.remoteId! };
}
