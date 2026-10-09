import type { CampaignStatus, CreativeKind, CreativeStatus, FunnelStage, Platform, ProjectStatus, SyncState } from '@advertex/shared';

export const PLATFORM_LABEL: Record<Platform, string> = { meta: 'Meta Ads', google: 'Google Ads' };

export const KIND_LABEL: Record<CreativeKind, string> = {
  meta_primary_text: 'Meta — texto principal',
  meta_headline: 'Meta — título',
  google_rsa_headline: 'Google — título RSA',
  google_rsa_description: 'Google — descrição RSA',
  script: 'Roteiro de vídeo',
  generic: 'Texto livre',
};

export const KIND_PLATFORM: Record<CreativeKind, Platform | null> = {
  meta_primary_text: 'meta',
  meta_headline: 'meta',
  google_rsa_headline: 'google',
  google_rsa_description: 'google',
  script: null,
  generic: null,
};

export const STAGE_LABEL: Record<FunnelStage, string> = {
  awareness: 'Topo — reconhecimento',
  consideration: 'Meio — consideração',
  conversion: 'Fundo — conversão',
  retention: 'Retenção',
};

export const CREATIVE_STATUS_LABEL: Record<CreativeStatus, string> = {
  draft: 'Rascunho',
  in_review: 'Em revisão',
  approved: 'Aprovado',
  rejected: 'Reprovado',
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = { active: 'Ativo', paused: 'Pausado', archived: 'Arquivado' };

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Rascunho local',
  active: 'Ativa',
  paused: 'Pausada',
  removed: 'Removida',
  unknown: 'Desconhecido',
};

export const SYNC_LABEL: Record<SyncState, string> = {
  local_only: 'Somente local',
  synced: 'Sincronizada',
  pending: 'Pendente',
  error: 'Erro',
};
