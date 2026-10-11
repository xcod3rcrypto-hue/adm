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

// ---------------------------------------------------------------------------
// Inteligência (diagnósticos e recomendações)
// ---------------------------------------------------------------------------

export const DiagnosticKind = z.enum([
  'cpa_increase',
  'conversion_drop',
  'overspend',
  'tracking_issue',
  'creative_fatigue',
  'spend_anomaly',
  'low_roas',
  'scale_opportunity',
]);
export type DiagnosticKind = z.infer<typeof DiagnosticKind>;

export type DiagnosticSeverity = 'critical' | 'warning' | 'opportunity' | 'info';

/** Ação sugerida por uma recomendação. Nunca é executada sem decisão humana ou regra de automação. */
export type SuggestedAction =
  | { type: 'review_campaign' }
  | { type: 'check_tracking' }
  | { type: 'refresh_creative' }
  | { type: 'pause_campaign' }
  | { type: 'adjust_budget'; changePercent: number };

export const RecommendationStatus = z.enum(['open', 'accepted', 'dismissed', 'done']);
export type RecommendationStatus = z.infer<typeof RecommendationStatus>;

export interface EvidenceItem {
  label: string;
  value: string;
}

export interface Insight {
  id: string;
  kind: DiagnosticKind;
  severity: DiagnosticSeverity;
  campaignId: string | null;
  campaignName: string | null;
  platform: Platform | null;
  title: string;
  summary: string;
  evidence: EvidenceItem[];
  confidence: number;
  impact: string;
  periodFrom: string | null;
  periodTo: string | null;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  insightId: string | null;
  campaignId: string | null;
  campaignName: string | null;
  title: string;
  rationale: string;
  evidence: EvidenceItem[];
  confidence: number | null;
  impact: string | null;
  risks: string | null;
  limitations: string | null;
  action: SuggestedAction | null;
  status: RecommendationStatus;
  periodFrom: string | null;
  periodTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntelligenceReport {
  isDemo: boolean;
  generatedAt: string | null;
  period: { from: string; to: string } | null;
  sources: MetricSource[];
  insights: Insight[];
  recommendations: Recommendation[];
  limitations: string[];
}

// ---------------------------------------------------------------------------
// Experimentos
// ---------------------------------------------------------------------------

export const ExperimentMetric = z.enum(['ctr', 'conversion_rate', 'cpa']);
export type ExperimentMetric = z.infer<typeof ExperimentMetric>;

export const ExperimentStatus = z.enum(['planned', 'running', 'concluded', 'inconclusive', 'cancelled']);
export type ExperimentStatus = z.infer<typeof ExperimentStatus>;

const isoDateOrNull = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null);

export const ExperimentVariantInput = z.object({
  id: Id.optional(),
  label: text(80).min(1, 'Nomeie a variante'),
  creativeId: Id.nullable().default(null),
  campaignId: Id.nullable().default(null),
  impressions: z.number().int().min(0).default(0),
  clicks: z.number().int().min(0).default(0),
  conversions: z.number().min(0).default(0),
  spend: z.number().min(0).default(0),
});
export type ExperimentVariantInput = z.input<typeof ExperimentVariantInput>;

export const ExperimentInput = z
  .object({
    projectId: Id.nullable().default(null),
    hypothesis: text(1000).min(10, 'Descreva a hipótese (ao menos 10 caracteres)'),
    variable: text(200).min(2, 'Informe a variável testada'),
    primaryMetric: ExperimentMetric,
    periodFrom: isoDateOrNull,
    periodTo: isoDateOrNull,
    decisionCriteria: text(1000).default(''),
    variants: z.array(ExperimentVariantInput).min(2, 'Cadastre ao menos duas variantes (controle e alternativa)').max(6),
  })
  .refine((d) => !d.periodFrom || !d.periodTo || d.periodTo >= d.periodFrom, { message: 'A data final deve ser posterior à inicial', path: ['periodTo'] });
export type ExperimentInput = z.input<typeof ExperimentInput>;

export interface ExperimentVariant {
  id: string;
  label: string;
  creativeId: string | null;
  creativeTitle: string | null;
  campaignId: string | null;
  campaignName: string | null;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface ExperimentResult {
  metric: ExperimentMetric;
  outcome: 'winner' | 'inconclusive';
  winnerId: string | null;
  alpha: number;
  minSample: string;
  reason: string;
  evaluatedAt: string;
  variants: Array<{ id: string; label: string; value: number | null; sampleOk: boolean }>;
  comparisons: Array<{ variantId: string; label: string; lift: number | null; pValue: number | null; significant: boolean; better: boolean | null }>;
}

export interface Experiment {
  id: string;
  organizationId: string;
  projectId: string | null;
  projectName: string | null;
  hypothesis: string;
  variable: string;
  primaryMetric: ExperimentMetric;
  periodFrom: string | null;
  periodTo: string | null;
  decisionCriteria: string;
  status: ExperimentStatus;
  variants: ExperimentVariant[];
  result: ExperimentResult | null;
  conclusion: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Publicação controlada nas plataformas
// ---------------------------------------------------------------------------

export type PlatformOperationStatus = 'pending' | 'succeeded' | 'failed' | 'unknown';

export interface PlatformOperation {
  id: string;
  campaignId: string | null;
  campaignName: string | null;
  platform: Platform;
  operation: string;
  status: PlatformOperationStatus;
  request: Record<string, unknown>;
  remoteId: string | null;
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export const PublishingLimits = z.object({
  /** Orçamento diário máximo permitido por campanha (na moeda da campanha). */
  maxDailyBudget: z.number().positive().max(10_000_000).nullable().default(null),
  /** Aumento percentual máximo de orçamento em uma única alteração. */
  maxBudgetIncreasePercent: z.number().positive().max(1000).nullable().default(50),
});
export type PublishingLimits = z.infer<typeof PublishingLimits>;

export interface PublishCheck {
  ok: boolean;
  items: Array<{ label: string; ok: boolean; detail: string }>;
}

// ---------------------------------------------------------------------------
// Automações
// ---------------------------------------------------------------------------

export const AutomationMode = z.enum(['read_only', 'recommend', 'approve', 'auto_limited']);
export type AutomationMode = z.infer<typeof AutomationMode>;

export const AutomationMetric = z.enum(['spend', 'conversions', 'clicks', 'impressions', 'ctr', 'cpc', 'cpa', 'roas']);
export type AutomationMetric = z.infer<typeof AutomationMetric>;

export const AutomationOperator = z.enum(['gt', 'gte', 'lt', 'lte', 'eq']);
export type AutomationOperator = z.infer<typeof AutomationOperator>;

export const AutomationCondition = z.object({
  metric: AutomationMetric,
  operator: AutomationOperator,
  value: z.number().min(0).max(1e12),
});
export type AutomationCondition = z.infer<typeof AutomationCondition>;

export const AutomationAction = z.discriminatedUnion('type', [
  z.object({ type: z.literal('notify') }),
  z.object({ type: z.literal('pause_campaign') }),
  z.object({ type: z.literal('adjust_budget'), changePercent: z.number().min(-90).max(100).refine((v) => v !== 0, 'Informe uma variação diferente de zero') }),
]);
export type AutomationAction = z.infer<typeof AutomationAction>;

export const AutomationFrequency = z.enum(['hourly', 'every_6_hours', 'daily']);
export type AutomationFrequency = z.infer<typeof AutomationFrequency>;

export const AutomationRuleInput = z
  .object({
    name: text(120).min(3, 'Nomeie a regra (ao menos 3 caracteres)'),
    mode: AutomationMode,
    platform: Platform.nullable().default(null),
    campaignIds: z.array(Id).max(200).default([]),
    conditions: z.array(AutomationCondition).min(1, 'Adicione ao menos uma condição').max(5),
    windowDays: z.number().int().min(1).max(90).default(7),
    frequency: AutomationFrequency.default('daily'),
    action: AutomationAction,
    /** Teto de orçamento diário que a regra pode definir (aumentos). */
    maxDailyBudget: z.number().positive().max(10_000_000).nullable().default(null),
    expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
    enabled: z.boolean().default(false),
  })
  .refine((r) => r.action.type !== 'adjust_budget' || r.action.changePercent < 0 || r.maxDailyBudget !== null, {
    message: 'Regras que aumentam orçamento exigem um teto de orçamento diário',
    path: ['maxDailyBudget'],
  })
  .refine((r) => r.mode !== 'read_only' || r.action.type === 'notify', {
    message: 'No modo somente leitura a ação deve ser apenas alertar',
    path: ['action'],
  });
export type AutomationRuleInput = z.input<typeof AutomationRuleInput>;

export interface AutomationRule {
  id: string;
  name: string;
  mode: AutomationMode;
  platform: Platform | null;
  campaignIds: string[];
  conditions: AutomationCondition[];
  windowDays: number;
  frequency: AutomationFrequency;
  action: AutomationAction;
  maxDailyBudget: number | null;
  expiresAt: string | null;
  enabled: boolean;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AutomationExecutionStatus = 'simulated' | 'pending_approval' | 'running' | 'succeeded' | 'failed' | 'cancelled';

export interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  campaignId: string | null;
  campaignName: string | null;
  status: AutomationExecutionStatus;
  simulated: boolean;
  summary: string;
  metrics: Record<string, number | null>;
  result: string | null;
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export interface AutomationMatch {
  campaignId: string;
  campaignName: string;
  platform: Platform;
  currency: string;
  metrics: Record<AutomationMetric, number | null>;
  plannedAction: string;
  blockedReason: string | null;
}

export interface AutomationSimulation {
  window: { from: string; to: string };
  evaluatedCampaigns: number;
  matches: AutomationMatch[];
  notes: string[];
}

export interface AutomationOverview {
  isDemo: boolean;
  killSwitch: boolean;
  rules: AutomationRule[];
  executions: AutomationExecution[];
  pendingApprovals: number;
}

export interface AppNotification {
  id: string;
  level: 'info' | 'warning' | 'error';
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Relatórios
// ---------------------------------------------------------------------------

export const ReportInput = z
  .object({
    title: text(160).min(3, 'Dê um título ao relatório'),
    projectId: Id.nullable().default(null),
    platform: Platform.nullable().default(null),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .refine((r) => r.to >= r.from, { message: 'A data final deve ser posterior à inicial', path: ['to'] });
export type ReportInput = z.input<typeof ReportInput>;

export interface ReportCampaignRow {
  campaignId: string;
  name: string;
  platform: Platform;
  currency: string;
  totals: MetricTotals;
  derived: DerivedMetrics;
}

export interface ReportContent {
  isDemo: boolean;
  organizationName: string;
  projectName: string | null;
  platform: Platform | null;
  period: { from: string; to: string };
  previousPeriod: { from: string; to: string };
  sources: MetricSource[];
  executiveSummary: string[];
  byCurrency: Array<{ currency: string; totals: MetricTotals; derived: DerivedMetrics; previous: { totals: MetricTotals; derived: DerivedMetrics } | null }>;
  byPlatform: Array<{ platform: Platform; currency: string; totals: MetricTotals; derived: DerivedMetrics }>;
  campaigns: ReportCampaignRow[];
  series: Array<{ currency: string; points: DashboardSeriesPoint[] }>;
  alerts: string[];
  recommendations: Array<{ title: string; campaignName: string | null; rationale: string; status: RecommendationStatus }>;
  limitations: string[];
}

export interface Report {
  id: string;
  title: string;
  projectId: string | null;
  periodFrom: string;
  periodTo: string;
  content: ReportContent;
  createdAt: string;
}

export type ReportSummary = Omit<Report, 'content'> & { isDemo: boolean; projectName: string | null; platform: Platform | null };

// ---------------------------------------------------------------------------
// Calendário
// ---------------------------------------------------------------------------

export const CalendarKind = z.enum(['task', 'launch', 'approval', 'review', 'deadline', 'other']);
export type CalendarKind = z.infer<typeof CalendarKind>;

export const CalendarStatus = z.enum(['todo', 'doing', 'done', 'cancelled']);
export type CalendarStatus = z.infer<typeof CalendarStatus>;

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida');

export const CalendarEventInput = z
  .object({
    title: text(200).min(2, 'Informe o título'),
    kind: CalendarKind.default('task'),
    startDate: ymd,
    endDate: ymd.nullable().default(null),
    responsible: text(120).default(''),
    status: CalendarStatus.default('todo'),
    notes: text(2000).default(''),
    projectId: Id.nullable().default(null),
    campaignId: Id.nullable().default(null),
  })
  .refine((e) => !e.endDate || e.endDate >= e.startDate, { message: 'A data final deve ser posterior à inicial', path: ['endDate'] });
export type CalendarEventInput = z.input<typeof CalendarEventInput>;

export interface CalendarItem {
  id: string;
  /** "event" é editável; campanhas, experimentos e aprovações são derivados. */
  source: 'event' | 'campaign' | 'experiment' | 'approval';
  title: string;
  kind: CalendarKind | 'campaign' | 'experiment';
  startDate: string;
  endDate: string | null;
  status: string;
  responsible: string;
  notes: string;
  projectId: string | null;
  projectName: string | null;
  campaignId: string | null;
  campaignName: string | null;
}

// ---------------------------------------------------------------------------
// Inteligência competitiva
// ---------------------------------------------------------------------------

export const CompetitorInput = z.object({
  name: text(120).min(2, 'Informe o nome do concorrente'),
  websiteUrl: z.union([z.literal(''), z.url({ protocol: /^https?$/, error: 'Use uma URL http(s) válida' }).max(2048)]).default(''),
  notes: text(2000).default(''),
  projectId: Id.nullable().default(null),
});
export type CompetitorInput = z.input<typeof CompetitorInput>;

export const ReferenceClassification = z.object({
  promise: text(300).default(''),
  concept: text(300).default(''),
  audience: text(300).default(''),
  format: text(300).default(''),
  positioning: text(300).default(''),
});
export type ReferenceClassification = z.infer<typeof ReferenceClassification>;

export interface CompetitorReference extends ReferenceClassification {
  id: string;
  sourceUrl: string;
  capturedAt: string;
  title: string;
  excerpt: string;
}

export interface Competitor {
  id: string;
  name: string;
  websiteUrl: string;
  notes: string;
  projectId: string | null;
  projectName: string | null;
  references: CompetitorReference[];
  createdAt: string;
  updatedAt: string;
}

export interface CompetitiveAnalysis {
  id: string;
  projectId: string | null;
  generatedAt: string;
  model: string;
  referenceCount: number;
  patterns: string[];
  opportunities: string[];
  differentiationIdeas: string[];
  caveats: string[];
}

// ---------------------------------------------------------------------------
// Atualização automática
// ---------------------------------------------------------------------------

export interface UpdateState {
  status: 'disabled' | 'idle' | 'checking' | 'up-to-date' | 'available' | 'downloading' | 'downloaded';
  currentVersion: string;
  availableVersion: string | null;
  progress: number | null;
  error: string | null;
  checkedAt: string | null;
}

// ---------------------------------------------------------------------------
// Rede de Pesquisa: palavras-chave, grupos de anúncios e anúncios responsivos
// ---------------------------------------------------------------------------

export const KeywordMatchType = z.enum(['BROAD', 'PHRASE', 'EXACT']);
export type KeywordMatchType = z.infer<typeof KeywordMatchType>;

/** Texto de palavra-chave aceito pelo Google (até 80 caracteres e 10 palavras). */
const keywordText = z
  .string()
  .trim()
  .min(1, 'Palavra-chave vazia')
  .max(80, 'Máximo de 80 caracteres por palavra-chave')
  .refine((t) => t.split(/\s+/).length <= 10, 'Máximo de 10 palavras por palavra-chave')
  .refine((t) => !/[!@%,*=]/.test(t), 'Remova símbolos como ! @ % , * =');

export const KeywordInput = z.object({ text: keywordText, matchType: KeywordMatchType.default('PHRASE') });
export type KeywordInput = z.input<typeof KeywordInput>;

export const KeywordIdeasRequest = z.object({
  seeds: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  url: z.union([z.literal(''), z.url({ protocol: /^https?$/ })]).default(''),
  language: z.enum(['pt', 'en', 'es']).default('pt'),
  location: z.enum(['BR', 'PT', 'US']).default('BR'),
});
export type KeywordIdeasRequest = z.input<typeof KeywordIdeasRequest>;

export interface KeywordIdea {
  text: string;
  source: 'google' | 'ai';
  avgMonthlySearches: number | null;
  competition: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  lowBid: number | null;
  highBid: number | null;
  suggestedMatchType: KeywordMatchType | null;
  note: string | null;
}

export interface KeywordIdeasResult {
  ideas: KeywordIdea[];
  negatives: string[];
  source: 'google' | 'ai';
  notes: string[];
}

const uniqueTexts = (list: string[]) => new Set(list.map((t) => t.trim().toLowerCase())).size === list.length;

export const ResponsiveSearchAdInput = z
  .object({
    finalUrl: z.url({ protocol: /^https?$/, error: 'Informe a URL da página de destino (http/https)' }).max(2048),
    path1: z.string().trim().max(15, 'Caminho 1: até 15 caracteres').regex(/^[^\s/]*$/, 'Caminho sem espaços ou barras').default(''),
    path2: z.string().trim().max(15, 'Caminho 2: até 15 caracteres').regex(/^[^\s/]*$/, 'Caminho sem espaços ou barras').default(''),
    headlines: z.array(z.string().trim().min(1).max(60)).min(3, 'Inclua ao menos 3 títulos').max(15, 'Máximo de 15 títulos'),
    descriptions: z.array(z.string().trim().min(1).max(180)).min(2, 'Inclua ao menos 2 descrições').max(4, 'Máximo de 4 descrições'),
  })
  .refine((a) => uniqueTexts(a.headlines), { message: 'Os títulos precisam ser diferentes entre si', path: ['headlines'] })
  .refine((a) => uniqueTexts(a.descriptions), { message: 'As descrições precisam ser diferentes entre si', path: ['descriptions'] })
  .refine((a) => !a.path2 || !!a.path1, { message: 'Preencha o caminho 1 antes do caminho 2', path: ['path2'] });
export type ResponsiveSearchAdInput = z.input<typeof ResponsiveSearchAdInput>;

export const SearchAdGroupInput = z.object({
  name: text(255).min(2, 'Nomeie o grupo de anúncios'),
  /** Lance máximo de CPC (na moeda da conta). Vazio = padrão do Google. */
  cpcBid: z.number().positive().max(10_000).nullable().default(null),
  keywords: z.array(KeywordInput).min(1, 'Adicione ao menos uma palavra-chave').max(200),
  negativeKeywords: z.array(keywordText).max(200).default([]),
  ad: ResponsiveSearchAdInput,
});
export type SearchAdGroupInput = z.input<typeof SearchAdGroupInput>;

export interface SearchAdGroup {
  id: string;
  campaignId: string;
  name: string;
  remoteId: string | null;
  cpcBid: number | null;
  keywords: Array<{ text: string; matchType: KeywordMatchType }>;
  negativeKeywords: string[];
  ad: { finalUrl: string; path1: string; path2: string; headlines: string[]; descriptions: string[]; remoteId: string | null };
  steps: { adGroup: boolean; keywords: boolean; negatives: boolean; ad: boolean };
  syncState: SyncState;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Rascunho completo de anúncio de Pesquisa gerado a partir da página de destino. */
export interface SearchAdDraft {
  finalUrl: string;
  path1: string;
  path2: string;
  headlines: string[];
  descriptions: string[];
  keywords: KeywordIdea[];
  negatives: string[];
  strategy: string;
  notes: string[];
}

// ---------------------------------------------------------------------------
// Geração de imagens (Gemini / Nano Banana)
// ---------------------------------------------------------------------------

export interface ImageAiConfigView {
  model: string;
  hasApiKey: boolean;
  secureStorageAvailable: boolean;
  models: Array<{ id: string; label: string }>;
}

export const ImageAspectRatio = z.enum(['1:1', '4:5', '9:16', '16:9', '3:4', '4:3']);
export type ImageAspectRatio = z.infer<typeof ImageAspectRatio>;

export const ImageGenerationRequest = z.object({
  projectId: Id.nullable().default(null),
  description: text(2000).min(10, 'Descreva a imagem (ao menos 10 caracteres)'),
  aspectRatio: ImageAspectRatio.default('1:1'),
  imageSize: z.enum(['1K', '2K', '4K']).default('2K'),
  count: z.number().int().min(1).max(4).default(1),
  useBrief: z.boolean().default(true),
  withText: z.boolean().default(false),
  referenceAssetIds: z.array(Id).max(3).default([]),
});
export type ImageGenerationRequest = z.input<typeof ImageGenerationRequest>;

export interface ImageGenerationResult {
  model: string;
  assets: Asset[];
  failed: number;
  notes: string[];
}

// ---------------------------------------------------------------------------
// Cérebro criativo: desempenho por anúncio, características e padrões
// ---------------------------------------------------------------------------

/** Ângulos/emoções/tons que a IA atribui a cada anúncio (valores fechados para permitir estatística). */
export const CREATIVE_AI_FEATURES = {
  angulo: ['beneficio', 'dor', 'curiosidade', 'prova_social', 'oferta', 'autoridade', 'urgencia', 'comparacao', 'novidade', 'identificacao'],
  emocao: ['confianca', 'alivio', 'desejo', 'medo', 'alegria', 'curiosidade', 'orgulho', 'neutra'],
  tom: ['direto', 'emocional', 'tecnico', 'divertido', 'inspirador', 'informativo'],
  gancho: ['pergunta', 'afirmacao_ousada', 'numero_dado', 'historia', 'comando', 'problema', 'beneficio_direto'],
} as const;
export type CreativeAiFeature = keyof typeof CREATIVE_AI_FEATURES;

export interface AdPerformance {
  id: string;
  platform: Platform;
  accountName: string | null;
  campaignId: string | null;
  campaignName: string | null;
  projectId: string | null;
  remoteAdId: string;
  adName: string;
  status: string;
  headline: string;
  body: string;
  cta: string;
  imageUrl: string | null;
  periodFrom: string;
  periodTo: string;
  currency: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number | null;
  ctr: number | null;
  cpa: number | null;
  conversionRate: number | null;
  features: Record<string, string>;
  aiTagged: boolean;
  source: 'demo' | 'meta' | 'google';
}

export interface CreativePattern {
  /** Padrões são calculados dentro de cada plataforma (CTR de Pesquisa e de feed não são comparáveis). */
  platform: Platform | null;
  feature: string;
  featureLabel: string;
  value: string;
  valueLabel: string;
  metric: 'ctr' | 'cvr';
  direction: 'positive' | 'negative';
  ads: number;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  rate: number;
  baselineRate: number;
  /** Variação relativa vs. os demais anúncios (0,5 = +50%). */
  lift: number;
  /** 1 − p-valor bicaudal. */
  confidence: number;
  sentence: string;
}

export interface CreativeBrainReport {
  periodFrom: string | null;
  periodTo: string | null;
  totals: { ads: number; impressions: number; clicks: number; conversions: number; spend: number; ctr: number | null; conversionRate: number | null };
  analyzedAds: number;
  pendingAiTagging: number;
  patterns: CreativePattern[];
  winners: AdPerformance[];
  losers: AdPerformance[];
  playbook: { rules: string[]; summary: string; model: string; createdAt: string } | null;
  useLearnings: boolean;
  limitations: string[];
}

export const BrainSyncRequest = z.object({
  accountId: Id,
  days: z.union([z.literal(30), z.literal(90), z.literal(180)]).default(90),
});
export type BrainSyncRequest = z.input<typeof BrainSyncRequest>;

// ---------------------------------------------------------------------------
// Piloto automático
// ---------------------------------------------------------------------------

export const AutopilotActionKind = z.enum(['add_negative', 'add_keyword', 'pause_ad', 'increase_budget', 'decrease_budget']);
export type AutopilotActionKind = z.infer<typeof AutopilotActionKind>;
export type AutopilotActionStatus = 'proposed' | 'applied' | 'failed' | 'dismissed';

export interface AutopilotAction {
  id: string;
  kind: AutopilotActionKind;
  platform: Platform;
  campaignId: string | null;
  campaignName: string | null;
  title: string;
  rationale: string;
  evidence: string[];
  impact: string;
  confidence: number;
  target: Record<string, string | number | null>;
  status: AutopilotActionStatus;
  auto: boolean;
  error: string | null;
  createdAt: string;
  appliedAt: string | null;
}

export const AutopilotSettings = z.object({
  targetCpa: z.number().positive().max(1_000_000).nullable().default(null),
  minClicksNegative: z.number().int().min(3).max(1000).default(12),
  minConversionsKeyword: z.number().min(1).max(1000).default(2),
  budgetStepPct: z.number().int().min(5).max(50).default(20),
  autoRunDaily: z.boolean().default(false),
  autoApplyNegatives: z.boolean().default(false),
  aiRelevance: z.boolean().default(true),
});
export type AutopilotSettings = z.infer<typeof AutopilotSettings>;

export interface SearchTermRow {
  id: string;
  campaignId: string | null;
  campaignName: string | null;
  term: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number | null;
  currency: string;
}

export interface AutopilotOverview {
  settings: AutopilotSettings;
  lastRunAt: string | null;
  lastRunSummary: string | null;
  killSwitch: boolean;
  proposed: AutopilotAction[];
  history: AutopilotAction[];
  searchTerms: { wasteful: SearchTermRow[]; converting: SearchTermRow[]; total: number; periodFrom: string | null; periodTo: string | null };
  savingsEstimate: number;
  currency: string;
}

export interface AutopilotRunResult {
  synced: string[];
  proposed: number;
  autoApplied: number;
  notes: string[];
}

// ---------------------------------------------------------------------------
// Fábrica de criativos
// ---------------------------------------------------------------------------

export const FactoryRequest = z.object({
  projectId: Id,
  kind: z.enum(['meta_primary_text', 'google_rsa_description', 'generic']).default('meta_primary_text'),
  funnelStage: FunnelStage.default('conversion'),
  angles: z.number().int().min(2).max(8).default(5),
  formats: z.array(z.enum(['1:1', '4:5', '9:16', '16:9'])).max(4).default(['1:1']),
  withImages: z.boolean().default(true),
  imageSize: z.enum(['1K', '2K']).default('2K'),
  /** Anúncio vencedor (do Cérebro) a multiplicar em variações. */
  winnerAdId: Id.nullable().default(null),
  instructions: text(1000).default(''),
  createExperiment: z.boolean().default(true),
});
export type FactoryRequest = z.input<typeof FactoryRequest>;

export interface FactoryResult {
  creatives: Creative[];
  assets: Asset[];
  experimentId: string | null;
  failedImages: number;
  notes: string[];
  model: string;
}

// ---------------------------------------------------------------------------
// Meta: conjuntos de anúncios e anúncios
// ---------------------------------------------------------------------------

export const MetaOptimizationGoal = z.enum(['OFFSITE_CONVERSIONS', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'REACH', 'IMPRESSIONS', 'POST_ENGAGEMENT']);
export type MetaOptimizationGoal = z.infer<typeof MetaOptimizationGoal>;

/** Metas de otimização aceitas por objetivo de campanha (Outcome). */
export const META_GOALS_BY_OBJECTIVE: Record<string, MetaOptimizationGoal[]> = {
  OUTCOME_SALES: ['OFFSITE_CONVERSIONS', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS'],
  OUTCOME_LEADS: ['OFFSITE_CONVERSIONS', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS'],
  OUTCOME_TRAFFIC: ['LANDING_PAGE_VIEWS', 'LINK_CLICKS'],
  OUTCOME_AWARENESS: ['REACH', 'IMPRESSIONS'],
  OUTCOME_ENGAGEMENT: ['POST_ENGAGEMENT'],
};

export const MetaConversionEvent = z.enum(['PURCHASE', 'LEAD', 'COMPLETE_REGISTRATION', 'ADD_TO_CART', 'INITIATE_CHECKOUT', 'CONTACT', 'SUBSCRIBE']);
export type MetaConversionEvent = z.infer<typeof MetaConversionEvent>;

export const MetaCta = z.enum(['SHOP_NOW', 'LEARN_MORE', 'SIGN_UP', 'BUY_NOW', 'ORDER_NOW', 'GET_OFFER', 'SUBSCRIBE', 'CONTACT_US', 'APPLY_NOW', 'GET_QUOTE', 'BOOK_NOW', 'DOWNLOAD']);
export type MetaCta = z.infer<typeof MetaCta>;

const metaId = z.string().trim().regex(/^\d{5,25}$/, 'ID numérico da Meta inválido');

export const MetaAdInput = z.object({
  id: Id.optional(),
  creativeId: Id,
  assetId: Id.nullable().default(null),
  headline: text(40).default(''),
  description: text(30).default(''),
});
export type MetaAdInput = z.input<typeof MetaAdInput>;

export const MetaAdSetInput = z
  .object({
    name: text(200).min(2, 'Nomeie o conjunto de anúncios'),
    optimizationGoal: MetaOptimizationGoal.default('LANDING_PAGE_VIEWS'),
    pixelId: metaId.nullable().default(null),
    conversionEvent: MetaConversionEvent.default('PURCHASE'),
    countries: z.array(z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, 'Use códigos de país com 2 letras (ex.: BR)')).min(1).max(25).default(['BR']),
    ageMin: z.number().int().min(18).max(65).default(18),
    ageMax: z.number().int().min(18).max(65).default(65),
    gender: z.enum(['all', 'male', 'female']).default('all'),
    advantageAudience: z.boolean().default(true),
    dailyBudget: z.number().positive().max(1_000_000).nullable().default(null),
    pageId: metaId.nullable().default(null),
    instagramUserId: metaId.nullable().default(null),
    link: z.string().trim().max(2000).default(''),
    cta: MetaCta.default('SHOP_NOW'),
    ads: z.array(MetaAdInput).max(20).default([]),
  })
  .refine((d) => d.ageMin <= d.ageMax, { message: 'A idade mínima deve ser menor que a máxima', path: ['ageMax'] })
  .refine((d) => !d.link || /^https:\/\/[^\s]+$/i.test(d.link), { message: 'O link de destino deve começar com https://', path: ['link'] });
export type MetaAdSetInput = z.input<typeof MetaAdSetInput>;

export interface MetaAdView {
  id: string;
  creativeId: string | null;
  creativeTitle: string | null;
  body: string;
  assetId: string | null;
  headline: string;
  description: string;
  remoteId: string | null;
  status: 'local' | 'image' | 'creative' | 'published';
  lastError: string | null;
}

export interface MetaAdSet {
  id: string;
  campaignId: string;
  name: string;
  optimizationGoal: MetaOptimizationGoal;
  pixelId: string | null;
  conversionEvent: MetaConversionEvent;
  countries: string[];
  ageMin: number;
  ageMax: number;
  gender: 'all' | 'male' | 'female';
  advantageAudience: boolean;
  dailyBudget: number | null;
  pageId: string | null;
  instagramUserId: string | null;
  link: string;
  cta: MetaCta;
  remoteId: string | null;
  syncState: SyncState;
  lastError: string | null;
  ads: MetaAdView[];
  /** O que ainda falta para enviar (vazio = pronto). */
  missing: string[];
  updatedAt: string;
}

export interface MetaAssetsOptions {
  pages: Array<{ id: string; name: string }>;
  instagram: Array<{ id: string; username: string }>;
  pixels: Array<{ id: string; name: string }>;
  notes: string[];
}

// ---------------------------------------------------------------------------
// Copiloto de IA
// ---------------------------------------------------------------------------

export interface CopilotToolStep {
  name: string;
  label: string;
  ok: boolean;
  summary: string;
}

/** Ação que o Copiloto sugere e que só é executada quando o usuário confirma. */
export interface CopilotProposal {
  id: string;
  kind: 'pause_campaign' | 'activate_campaign' | 'set_budget';
  campaignId: string;
  campaignName: string;
  value: number | null;
  currency: string;
  reason: string;
  status: 'pending' | 'done' | 'failed' | 'dismissed';
  error: string | null;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  steps: CopilotToolStep[];
  proposals: CopilotProposal[];
  createdAt: string;
}

export interface CopilotConversation {
  id: string;
  title: string;
  messages: CopilotMessage[];
  model: string | null;
  updatedAt: string;
}

export interface CopilotConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Saldo e pagamentos
// ---------------------------------------------------------------------------

/**
 * prepaid: saldo pré-pago (Pix/boleto) · card: cobrança automática (cartão) ·
 * budget: orçamento da conta / faturamento mensal (Google) · unknown: a API não informou.
 */
export type BillingKind = 'prepaid' | 'card' | 'budget' | 'unknown';
export type BillingAlert = 'ok' | 'warning' | 'critical' | 'none';

export interface BillingAccountView {
  accountId: string;
  platform: Platform;
  remoteId: string;
  name: string;
  currency: string;
  status: string;
  kind: BillingKind;
  /** Meta: saldo informado pela API (pré-pago: crédito disponível; cartão: valor a cobrar). */
  balance: number | null;
  /** Meta: total já gasto na conta (amount_spent, acumulado desde o último reset do limite). */
  amountSpent: number | null;
  /** Meta: limite de gastos da conta (null = sem limite). */
  spendCap: number | null;
  spendCapRemaining: number | null;
  fundingSource: string | null;
  /** Google: orçamento aprovado da conta. */
  budget: { name: string; limit: number | null; served: number; remaining: number | null; start: string | null; end: string | null } | null;
  /** Gasto médio por dia nos últimos 7 dias (métricas sincronizadas). */
  avgDailySpend7d: number | null;
  spendToday: number | null;
  /** Dias estimados até acabar o saldo/orçamento/limite, no ritmo atual. */
  daysLeft: number | null;
  alert: BillingAlert;
  paymentUrl: string;
  notes: string[];
  error: string | null;
}

export interface BillingOverview {
  accounts: BillingAccountView[];
  checkedAt: string;
}
