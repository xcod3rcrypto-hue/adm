import type { Platform } from '@advertex/shared';
import type { MetricRow } from './metrics';

/** Conta de anúncios como retornada pela plataforma (antes do mapeamento local). */
export interface RemoteAccount {
  remoteId: string;
  name: string;
  currency: string | null;
  timezone: string | null;
  status: string | null;
  /** Google Ads: conta usada no cabeçalho login-customer-id para acessar esta conta. */
  loginCustomerId?: string | null;
}

export interface RemoteCampaign {
  remoteId: string;
  name: string;
  objective: string;
  status: 'active' | 'paused' | 'removed' | 'unknown';
  rawStatus: string;
  dailyBudget: number | null;
  startDate: string | null;
  endDate: string | null;
}

export interface RemoteInsightRow extends MetricRow {
  campaignRemoteId: string;
}

export interface DateRange {
  from: string;
  to: string;
}

/**
 * Operações explícitas do modelo unificado. Cada plataforma implementa o que
 * suporta. Leituras podem ser repetidas; escritas nunca são repetidas
 * automaticamente (ver AdPlatformWriter).
 */
export interface AdPlatformReader {
  readonly platform: Platform;
  listAccounts(): Promise<RemoteAccount[]>;
  listCampaigns(accountRemoteId: string): Promise<RemoteCampaign[]>;
  fetchInsights(accountRemoteId: string, range: DateRange): Promise<RemoteInsightRow[]>;
}

/** Especificação mínima para criar uma campanha. Sempre criada PAUSADA. */
export interface CampaignSpec {
  name: string;
  objective: string;
  dailyBudget: number;
  currency: string;
}

export interface UploadedAsset {
  /** Identificador remoto (hash da imagem na Meta, resource name no Google). */
  remoteId: string;
}

/**
 * Escritas nas plataformas. Requisições de escrita NÃO usam retentativas
 * automáticas: uma falha de rede deixa o resultado incerto, e quem chama deve
 * verificar o estado remoto (findCampaignByName) antes de tentar de novo.
 */
export interface AdPlatformWriter {
  readonly platform: Platform;
  createCampaign(accountRemoteId: string, spec: CampaignSpec): Promise<{ remoteId: string }>;
  findCampaignByName(accountRemoteId: string, name: string): Promise<string | null>;
  setCampaignStatus(accountRemoteId: string, campaignRemoteId: string, status: 'active' | 'paused'): Promise<void>;
  updateDailyBudget(accountRemoteId: string, campaignRemoteId: string, amount: number, currency: string): Promise<void>;
  uploadImage(accountRemoteId: string, fileName: string, data: Uint8Array): Promise<UploadedAsset>;
}

/** Erro retornado por uma API de anúncios, sem dados sensíveis. */
export class PlatformApiError extends Error {
  constructor(
    readonly platform: Platform,
    readonly status: number,
    message: string,
    readonly retryable: boolean,
    readonly remoteCode?: string | number,
  ) {
    super(message);
    this.name = 'PlatformApiError';
  }
}
