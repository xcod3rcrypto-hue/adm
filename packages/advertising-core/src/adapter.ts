import type { Platform } from '@advertex/shared';
import type { MetricRow } from './metrics';

/** Conta de anúncios como retornada pela plataforma (antes do mapeamento local). */
export interface RemoteAccount {
  remoteId: string;
  name: string;
  currency: string | null;
  timezone: string | null;
  status: string | null;
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
 * suporta; operações de escrita (create/update/pause/resume/uploadAsset/createAd)
 * entram na Fase 5 e, até lá, não são expostas pela interface.
 */
export interface AdPlatformReader {
  readonly platform: Platform;
  listAccounts(): Promise<RemoteAccount[]>;
  listCampaigns(accountRemoteId: string): Promise<RemoteCampaign[]>;
  fetchInsights(accountRemoteId: string, range: DateRange): Promise<RemoteInsightRow[]>;
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
