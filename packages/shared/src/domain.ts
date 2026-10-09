import { z } from 'zod';

/** Identificadores internos são UUID v4 gerados no processo principal. */
export const Id = z.uuid();

const text = (max: number) => z.string().trim().max(max);

export const Platform = z.enum(['meta', 'google']);
export type Platform = z.infer<typeof Platform>;

// ---------------------------------------------------------------------------
// Organizações, clientes e projetos
// ---------------------------------------------------------------------------

export const OrganizationInput = z.object({ name: text(120).min(2, 'Informe ao menos 2 caracteres') });
export type OrganizationInput = z.infer<typeof OrganizationInput>;

export interface Organization {
  id: string;
  name: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ClientInput = z.object({
  name: text(120).min(2, 'Informe ao menos 2 caracteres'),
  notes: text(2000).default(''),
});
export type ClientInput = z.infer<typeof ClientInput>;

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  notes: string;
  createdAt: string;
}

export const ProjectStatus = z.enum(['active', 'paused', 'archived']);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

export const ProjectInput = z.object({
  name: text(120).min(2, 'Informe ao menos 2 caracteres'),
  description: text(2000).default(''),
  clientId: Id.nullable().default(null),
  objective: text(500).default(''),
  status: ProjectStatus.default('active'),
});
export type ProjectInput = z.input<typeof ProjectInput>;

export interface Project {
  id: string;
  organizationId: string;
  clientId: string | null;
  clientName: string | null;
  name: string;
  description: string;
  objective: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Briefing
// ---------------------------------------------------------------------------

export const BriefData = z.object({
  segment: text(200).default(''),
  productOrService: text(500).min(2, 'Descreva o produto ou serviço'),
  offer: text(1000).default(''),
  region: text(300).default(''),
  language: text(20).default('pt-BR'),
  targetAudience: text(2000).default(''),
  differentiators: text(2000).default(''),
  objections: text(2000).default(''),
  toneOfVoice: text(500).default(''),
  objectives: text(2000).default(''),
  kpis: text(1000).default(''),
  budget: text(200).default(''),
  competitors: text(2000).default(''),
  restrictions: text(2000).default(''),
  websiteUrl: z.union([z.literal(''), z.url({ protocol: /^https?$/, error: 'Use uma URL http(s) válida' }).max(2048)]).default(''),
  additionalNotes: text(4000).default(''),
});
export type BriefData = z.infer<typeof BriefData>;
export type BriefDataInput = z.input<typeof BriefData>;

/** Resultado estruturado gerado por IA a partir do briefing. */
export const BriefInsights = z.object({
  businessSummary: z.string(),
  valueProposition: z.string(),
  communicationPillars: z.array(z.string()),
  campaignHypotheses: z.array(z.string()),
  messageMatrix: z.array(z.object({ audience: z.string(), stage: z.string(), message: z.string() })),
  missingInformation: z.array(z.string()),
});
export type BriefInsights = z.infer<typeof BriefInsights>;

export interface BriefVersion {
  id: string;
  briefId: string;
  version: number;
  data: BriefData;
  note: string;
  createdAt: string;
}

export interface Brief {
  id: string;
  projectId: string;
  currentVersion: number;
  data: BriefData;
  insights: BriefInsights | null;
  insightsGeneratedAt: string | null;
  insightsModel: string | null;
  updatedAt: string;
}

export interface PageAnalysis {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  status: number;
  title: string;
  description: string;
  headings: string[];
  textExcerpt: string;
}

// ---------------------------------------------------------------------------
// Criativos e ativos
// ---------------------------------------------------------------------------

export const CreativeKind = z.enum(['meta_primary_text', 'meta_headline', 'google_rsa_headline', 'google_rsa_description', 'script', 'generic']);
export type CreativeKind = z.infer<typeof CreativeKind>;

export const CreativeStatus = z.enum(['draft', 'in_review', 'approved', 'rejected']);
export type CreativeStatus = z.infer<typeof CreativeStatus>;

export const FunnelStage = z.enum(['awareness', 'consideration', 'conversion', 'retention']);
export type FunnelStage = z.infer<typeof FunnelStage>;

export const CreativeInput = z.object({
  projectId: Id.nullable().default(null),
  title: text(200).min(1, 'Informe um título interno'),
  kind: CreativeKind,
  platform: Platform.nullable().default(null),
  funnelStage: FunnelStage.nullable().default(null),
  body: text(5000).min(1, 'O conteúdo não pode ficar vazio'),
  cta: text(60).default(''),
  tags: z.array(text(40).min(1)).max(20).default([]),
  assetIds: z.array(Id).max(20).default([]),
  source: z.enum(['manual', 'ai']).default('manual'),
  aiJobId: Id.nullable().default(null),
});
export type CreativeInput = z.input<typeof CreativeInput>;

export interface Creative {
  id: string;
  organizationId: string;
  projectId: string | null;
  projectName: string | null;
  title: string;
  kind: CreativeKind;
  platform: Platform | null;
  funnelStage: FunnelStage | null;
  body: string;
  cta: string;
  tags: string[];
  assetIds: string[];
  status: CreativeStatus;
  source: 'manual' | 'ai';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreativeVersion {
  id: string;
  creativeId: string;
  version: number;
  title: string;
  body: string;
  cta: string;
  note: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  organizationId: string;
  projectId: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  width: number | null;
  height: number | null;
  tags: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Campanhas (modelo unificado)
// ---------------------------------------------------------------------------

export const CampaignStatus = z.enum(['draft', 'active', 'paused', 'removed', 'unknown']);
export type CampaignStatus = z.infer<typeof CampaignStatus>;

export const SyncState = z.enum(['local_only', 'synced', 'pending', 'error']);
export type SyncState = z.infer<typeof SyncState>;

export const CampaignInput = z.object({
  projectId: Id.nullable().default(null),
  platform: Platform,
  name: text(200).min(2, 'Informe o nome da campanha'),
  objective: text(80).min(1, 'Selecione um objetivo'),
  dailyBudget: z.number().positive('O orçamento deve ser positivo').max(10_000_000).nullable().default(null),
  currency: z.string().regex(/^[A-Z]{3}$/, 'Moeda ISO 4217, ex.: BRL').default('BRL'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
  notes: text(2000).default(''),
});
export type CampaignInput = z.input<typeof CampaignInput>;

export interface Campaign {
  id: string;
  organizationId: string;
  projectId: string | null;
  projectName: string | null;
  platform: Platform;
  advertisingAccountId: string | null;
  accountName: string | null;
  remoteId: string | null;
  name: string;
  objective: string;
  status: CampaignStatus;
  dailyBudget: number | null;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  notes: string;
  syncState: SyncState;
  lastSyncedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Métricas
// ---------------------------------------------------------------------------

export type MetricSource = 'demo' | 'meta' | 'google';

export interface MetricTotals {
  spend: number;
  impressions: number;
  reach: number | null;
  clicks: number;
  conversions: number;
  revenue: number | null;
}

export interface DerivedMetrics {
  ctr: number | null;
  cpm: number | null;
  cpc: number | null;
  cpa: number | null;
  roas: number | null;
}

export interface DashboardSeriesPoint {
  date: string;
  spend: number;
  clicks: number;
  conversions: number;
  impressions: number;
}

export interface DashboardSummary {
  isDemo: boolean;
  sources: MetricSource[];
  /** Totais separados por moeda: nunca somamos valores em moedas diferentes. */
  byCurrency: Array<{ currency: string; totals: MetricTotals; derived: DerivedMetrics }>;
  previous: Array<{ currency: string; totals: MetricTotals; derived: DerivedMetrics }>;
  series: Array<{ currency: string; points: DashboardSeriesPoint[] }>;
  byPlatform: Array<{ platform: Platform; currency: string; totals: MetricTotals; derived: DerivedMetrics }>;
  topCampaigns: Array<{ campaignId: string; name: string; platform: Platform; currency: string; totals: MetricTotals; derived: DerivedMetrics }>;
  alerts: Array<{ level: 'info' | 'warning'; message: string }>;
  period: { from: string; to: string };
  lastSyncedAt: string | null;
}

// ---------------------------------------------------------------------------
// IA
// ---------------------------------------------------------------------------

export const AiProviderId = z.enum(['anthropic']);
export type AiProviderId = z.infer<typeof AiProviderId>;

export interface AiConfigView {
  provider: AiProviderId;
  model: string;
  hasApiKey: boolean;
  secureStorageAvailable: boolean;
}

export const StudioRequest = z.object({
  projectId: Id,
  kind: CreativeKind,
  funnelStage: FunnelStage,
  audience: text(500).default(''),
  count: z.number().int().min(1).max(10).default(5),
  instructions: text(2000).default(''),
});
export type StudioRequest = z.input<typeof StudioRequest>;

export interface StudioVariation {
  text: string;
  rationale: string;
  characterCount: number;
  withinLimit: boolean;
  limit: number | null;
}

export interface StudioResult {
  jobId: string;
  model: string;
  variations: StudioVariation[];
}

// ---------------------------------------------------------------------------
// Integrações
// ---------------------------------------------------------------------------

export type ConnectionState = 'not_configured' | 'configured' | 'connected' | 'error';

export interface AdvertisingAccount {
  id: string;
  platform: Platform;
  remoteId: string;
  name: string;
  currency: string | null;
  timezone: string | null;
  status: string | null;
  lastSyncedAt: string | null;
}

export interface IntegrationView {
  platform: Platform;
  state: ConnectionState;
  apiVersion: string;
  configuredFields: string[];
  lastCheckedAt: string | null;
  lastError: string | null;
  identity: string | null;
  accounts: AdvertisingAccount[];
}

export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  outcome: 'success' | 'failure';
  details: Record<string, unknown>;
  createdAt: string;
}

export interface OnboardingState {
  hasOrganization: boolean;
  checklist: {
    organization: boolean;
    project: boolean;
    brief: boolean;
    ai: boolean;
    meta: boolean;
    google: boolean;
  };
}

export interface AppInfo {
  name: string;
  version: string;
  electron: string;
  platform: string;
  isPackaged: boolean;
  userDataPath: string;
  logsPath: string;
  databasePath: string;
}
