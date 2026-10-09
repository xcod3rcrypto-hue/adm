import { z } from 'zod';
import {
  BriefData,
  CampaignInput,
  ClientInput,
  CreativeInput,
  CreativeStatus,
  Id,
  OrganizationInput,
  Platform,
  ProjectInput,
  StudioRequest,
  type AdvertisingAccount,
  type AiConfigView,
  type AppInfo,
  type Asset,
  type AuditEntry,
  type Brief,
  type BriefVersion,
  type Campaign,
  type Client,
  type Creative,
  type CreativeVersion,
  type DashboardSummary,
  type IntegrationView,
  type IntelligenceReport,
  type Experiment,
  type PlatformOperation,
  type AppNotification,
  type UpdateState,
  type SearchAdGroup,
  type ImageAiConfigView,
  type ImageGenerationResult,
  ImageGenerationRequest,
  type SearchAdDraft,
  type MetaAdSet,
  type MetaAssetsOptions,
  MetaAdSetInput,
  type CreativeBrainReport,
  type AdPerformance,
  BrainSyncRequest,
  type AutopilotOverview,
  type AutopilotRunResult,
  AutopilotSettings,
  type FactoryResult,
  FactoryRequest,
  type KeywordIdeasResult,
  KeywordIdeasRequest,
  SearchAdGroupInput,
  type Report,
  type CalendarItem,
  type Competitor,
  type CompetitorReference,
  type CompetitiveAnalysis,
  CompetitorInput,
  ReferenceClassification,
  CalendarEventInput,
  type ReportSummary,
  ReportInput,
  type AutomationExecution,
  type AutomationOverview,
  type AutomationRule,
  type AutomationSimulation,
  AutomationRuleInput,
  type PublishCheck,
  PublishingLimits,
  ExperimentInput,
  type Recommendation,
  RecommendationStatus,
  type OnboardingState,
  type Organization,
  type PageAnalysis,
  type Project,
  type StudioResult,
} from './domain';

const none = z.undefined();
const org = { organizationId: Id };
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * Contrato IPC: cada canal declara o schema de entrada, validado no processo
 * principal antes de qualquer lógica. O renderer só consegue chamar canais
 * listados aqui (lista de permissões no preload).
 */
export const ipcInputs = {
  'app.getInfo': none,
  'app.openPath': z.object({ target: z.enum(['logs', 'data']) }),
  'app.openExternal': z.object({ url: z.url({ protocol: /^https$/ }) }),
  'app.updateStatus': none,
  'app.checkUpdates': none,
  'app.downloadUpdate': none,
  'app.installUpdate': none,

  'onboarding.getState': z.object({ organizationId: Id.nullable() }),

  'org.list': none,
  'org.create': OrganizationInput,
  'org.rename': z.object({ ...org, name: OrganizationInput.shape.name }),
  'org.getActive': none,
  'org.setActive': z.object(org),

  'demo.enable': none,
  'demo.disable': none,

  'client.list': z.object(org),
  'client.create': z.object({ ...org, data: ClientInput }),

  'project.list': z.object({ ...org, includeArchived: z.boolean().default(false) }),
  'project.get': z.object({ ...org, id: Id }),
  'project.create': z.object({ ...org, data: ProjectInput }),
  'project.update': z.object({ ...org, id: Id, data: ProjectInput }),
  'project.delete': z.object({ ...org, id: Id }),

  'brief.get': z.object({ ...org, projectId: Id }),
  'brief.save': z.object({ ...org, projectId: Id, data: BriefData, note: z.string().trim().max(300).default('') }),
  'brief.versions': z.object({ ...org, projectId: Id }),
  'brief.restore': z.object({ ...org, projectId: Id, versionId: Id }),
  'brief.analyzeUrl': z.object({ ...org, url: z.url({ protocol: /^https?$/ }) }),
  'brief.generateInsights': z.object({ ...org, projectId: Id }),

  'ai.getConfig': none,
  'ai.saveConfig': z.object({
    model: z.string().trim().min(3).max(100),
    apiKey: z.string().trim().min(10).max(500).optional(),
  }),
  'ai.clearKey': none,
  'ai.test': none,

  'image.getConfig': none,
  'image.saveConfig': z.object({ model: z.string().trim().min(3).max(100), apiKey: z.string().trim().min(10).max(500).optional() }),
  'image.clearKey': none,
  'image.test': none,
  'image.generate': z.object({ ...org, request: ImageGenerationRequest }),

  'studio.generate': z.object({ ...org, request: StudioRequest }),

  'creative.list': z.object({
    ...org,
    projectId: Id.nullable().default(null),
    search: z.string().trim().max(200).default(''),
    status: CreativeStatus.nullable().default(null),
    tag: z.string().trim().max(40).default(''),
  }),
  'creative.create': z.object({ ...org, data: CreativeInput }),
  'creative.update': z.object({ ...org, id: Id, data: CreativeInput, note: z.string().trim().max(300).default('') }),
  'creative.setStatus': z.object({ ...org, id: Id, status: CreativeStatus }),
  'creative.versions': z.object({ ...org, id: Id }),
  'creative.delete': z.object({ ...org, id: Id }),

  'asset.import': z.object({ ...org, projectId: Id.nullable().default(null) }),
  'asset.list': z.object({ ...org, projectId: Id.nullable().default(null), search: z.string().trim().max(200).default('') }),
  'asset.updateTags': z.object({ ...org, id: Id, tags: z.array(z.string().trim().min(1).max(40)).max(20) }),
  'asset.delete': z.object({ ...org, id: Id }),
  'asset.export': z.object({ ...org, id: Id }),

  'campaign.list': z.object({ ...org, platform: Platform.nullable().default(null) }),
  'campaign.create': z.object({ ...org, data: CampaignInput }),
  'campaign.update': z.object({ ...org, id: Id, data: CampaignInput }),
  'campaign.delete': z.object({ ...org, id: Id }),

  'campaign.preflight': z.object({ ...org, id: Id, accountId: Id.nullable().default(null) }),
  'campaign.publish': z.object({ ...org, id: Id, accountId: Id, confirm: z.literal(true) }),
  'campaign.setRemoteStatus': z.object({ ...org, id: Id, status: z.enum(['active', 'paused']), confirm: z.literal(true) }),
  'campaign.updateRemoteBudget': z.object({ ...org, id: Id, amount: z.number().positive().max(10_000_000), confirm: z.literal(true) }),
  'campaign.operations': z.object({ ...org, id: Id.nullable().default(null) }),
  'search.adGroups': z.object({ ...org, campaignId: Id }),
  'search.saveAdGroup': z.object({ ...org, campaignId: Id, id: Id.nullable().default(null), data: SearchAdGroupInput }),
  'search.deleteAdGroup': z.object({ ...org, id: Id }),
  'search.pushAdGroup': z.object({ ...org, id: Id, confirm: z.literal(true) }),
  'search.keywordIdeasGoogle': z.object({ ...org, campaignId: Id, request: KeywordIdeasRequest }),
  'search.keywordIdeasAi': z.object({ ...org, campaignId: Id, seeds: z.array(z.string().trim().min(1).max(80)).max(20).default([]) }),
  'search.adFromPage': z.object({ ...org, campaignId: Id, url: z.url({ protocol: /^https?$/ }), seeds: z.array(z.string().trim().min(1).max(80)).max(20).default([]) }),
  'publishing.getLimits': z.object(org),
  'publishing.saveLimits': z.object({ ...org, limits: PublishingLimits }),
  'asset.uploadToPlatform': z.object({ ...org, id: Id, accountId: Id }),

  'dashboard.summary': z.object({ ...org, from: isoDate, to: isoDate, platform: Platform.nullable().default(null) }),

  'integration.list': z.object(org),
  'integration.meta.save': z.object({
    ...org,
    accessToken: z.string().trim().min(20).max(1000).optional(),
    apiVersion: z.string().regex(/^v\d+\.\d+$/, 'Formato: v26.0'),
  }),
  'integration.meta.test': z.object(org),
  'integration.meta.syncAccounts': z.object(org),
  'integration.meta.syncCampaigns': z.object({ ...org, accountId: Id }),
  'integration.meta.syncInsights': z.object({ ...org, accountId: Id, from: isoDate, to: isoDate }),
  'integration.google.save': z.object({
    ...org,
    clientId: z.string().trim().min(10).max(300).optional(),
    clientSecret: z.string().trim().min(5).max(300).optional(),
    developerToken: z.string().trim().min(5).max(300).optional(),
    loginCustomerId: z
      .string()
      .trim()
      .transform((v) => v.replace(/-/g, ''))
      .pipe(z.string().regex(/^(\d{10})?$/, 'Informe os 10 dígitos do ID da conta de administrador'))
      .default(''),
    apiVersion: z.string().regex(/^v\d+$/, 'Formato: v25'),
  }),
  'integration.google.authorize': z.object(org),
  'integration.google.syncAccounts': z.object(org),
  'integration.google.syncCampaigns': z.object({ ...org, accountId: Id }),
  'integration.google.syncInsights': z.object({ ...org, accountId: Id, from: isoDate, to: isoDate }),
  'integration.disconnect': z.object({ ...org, platform: Platform }),

  'brain.report': z.object({ ...org, platform: Platform.nullable().default(null), projectId: Id.nullable().default(null) }),
  'brain.sync': z.object({ ...org, platform: Platform, request: BrainSyncRequest }),
  'brain.tag': z.object(org),
  'brain.playbook': z.object(org),
  'brain.setUseLearnings': z.object({ ...org, enabled: z.boolean() }),
  'brain.ads': z.object({ ...org, platform: Platform.nullable().default(null) }),

  'autopilot.overview': z.object(org),
  'autopilot.saveSettings': z.object({ ...org, settings: AutopilotSettings }),
  'autopilot.run': z.object({ ...org, sync: z.boolean().default(true) }),
  'autopilot.apply': z.object({ ...org, ids: z.array(Id).min(1).max(100), confirm: z.literal(true) }),
  'autopilot.dismiss': z.object({ ...org, id: Id }),

  'factory.run': z.object({ ...org, request: FactoryRequest }),

  'campaign.deleteRemote': z.object({ ...org, id: Id, confirmName: z.string().max(300) }),
  'campaign.removeLocal': z.object({ ...org, id: Id }),

  'meta.adSets': z.object({ ...org, campaignId: Id }),
  'meta.saveAdSet': z.object({ ...org, campaignId: Id, id: Id.nullable(), data: MetaAdSetInput }),
  'meta.deleteAdSet': z.object({ ...org, id: Id }),
  'meta.pushAdSet': z.object({ ...org, id: Id, confirm: z.literal(true) }),
  'meta.assetsOptions': z.object({ ...org, campaignId: Id }),
  'meta.adSetFromCreatives': z.object({ ...org, campaignId: Id, creativeIds: z.array(Id).min(1).max(20) }),

  'intelligence.get': z.object(org),
  'intelligence.run': z.object({ ...org, from: isoDate, to: isoDate, platform: Platform.nullable().default(null) }),
  'recommendation.setStatus': z.object({ ...org, id: Id, status: RecommendationStatus }),

  'experiment.list': z.object(org),
  'experiment.create': z.object({ ...org, data: ExperimentInput }),
  'experiment.update': z.object({ ...org, id: Id, data: ExperimentInput }),
  'experiment.importMetrics': z.object({ ...org, id: Id }),
  'experiment.evaluate': z.object({ ...org, id: Id }),
  'experiment.conclude': z.object({ ...org, id: Id, conclusion: z.string().trim().max(4000).default('') }),
  'experiment.setStatus': z.object({ ...org, id: Id, status: z.enum(['planned', 'running', 'cancelled']) }),
  'experiment.delete': z.object({ ...org, id: Id }),

  'automation.overview': z.object(org),
  'automation.create': z.object({ ...org, data: AutomationRuleInput }),
  'automation.update': z.object({ ...org, id: Id, data: AutomationRuleInput }),
  'automation.delete': z.object({ ...org, id: Id }),
  'automation.setEnabled': z.object({ ...org, id: Id, enabled: z.boolean() }),
  'automation.simulate': z.object({ ...org, data: AutomationRuleInput }),
  'automation.runNow': z.object({ ...org, id: Id }),
  'automation.decide': z.object({ ...org, executionId: Id, decision: z.enum(['approve', 'reject']) }),
  'automation.killSwitch': z.object({ ...org, active: z.boolean() }),
  'notification.list': z.object(org),
  'notification.unread': z.object(org),
  'notification.markRead': z.object({ ...org, ids: z.array(Id).max(500).nullable().default(null) }),

  'report.list': z.object(org),
  'report.create': z.object({ ...org, data: ReportInput }),
  'report.get': z.object({ ...org, id: Id }),
  'report.delete': z.object({ ...org, id: Id }),
  'report.export': z.object({ ...org, id: Id, format: z.enum(['csv', 'pdf']) }),

  'calendar.list': z.object({ ...org, from: isoDate, to: isoDate }),
  'calendar.create': z.object({ ...org, data: CalendarEventInput }),
  'calendar.update': z.object({ ...org, id: Id, data: CalendarEventInput }),
  'calendar.delete': z.object({ ...org, id: Id }),

  'competitor.list': z.object(org),
  'competitor.create': z.object({ ...org, data: CompetitorInput }),
  'competitor.update': z.object({ ...org, id: Id, data: CompetitorInput }),
  'competitor.delete': z.object({ ...org, id: Id }),
  'competitor.capture': z.object({ ...org, competitorId: Id, url: z.url({ protocol: /^https?$/ }) }),
  'competitor.classify': z.object({ ...org, id: Id, data: ReferenceClassification }),
  'competitor.classifyAi': z.object({ ...org, id: Id }),
  'competitor.deleteReference': z.object({ ...org, id: Id }),
  'competitor.analyze': z.object({ ...org, projectId: Id.nullable().default(null) }),
  'competitor.latestAnalysis': z.object({ ...org, projectId: Id.nullable().default(null) }),

  'audit.list': z.object({ ...org, limit: z.number().int().min(1).max(500).default(100) }),
} as const;

export type Channel = keyof typeof ipcInputs;
export type ChannelInput<C extends Channel> = z.input<(typeof ipcInputs)[C]>;
export type ChannelParsed<C extends Channel> = z.output<(typeof ipcInputs)[C]>;

export interface SyncResult {
  imported: number;
  updated: number;
  message: string;
}

export interface ChannelOutputs {
  'app.getInfo': AppInfo;
  'app.openPath': void;
  'app.openExternal': void;
  'app.updateStatus': UpdateState;
  'app.checkUpdates': UpdateState;
  'app.downloadUpdate': UpdateState;
  'app.installUpdate': void;
  'onboarding.getState': OnboardingState;
  'org.list': Organization[];
  'org.create': Organization;
  'org.rename': Organization;
  'org.getActive': Organization | null;
  'org.setActive': Organization;
  'demo.enable': Organization;
  'demo.disable': void;
  'client.list': Client[];
  'client.create': Client;
  'project.list': Project[];
  'project.get': Project;
  'project.create': Project;
  'project.update': Project;
  'project.delete': void;
  'brief.get': Brief | null;
  'brief.save': Brief;
  'brief.versions': BriefVersion[];
  'brief.restore': Brief;
  'brief.analyzeUrl': PageAnalysis;
  'brief.generateInsights': Brief;
  'ai.getConfig': AiConfigView;
  'ai.saveConfig': AiConfigView;
  'ai.clearKey': AiConfigView;
  'ai.test': { model: string; reply: string };
  'image.getConfig': ImageAiConfigView;
  'image.saveConfig': ImageAiConfigView;
  'image.clearKey': ImageAiConfigView;
  'image.test': { model: string };
  'image.generate': ImageGenerationResult;
  'studio.generate': StudioResult;
  'creative.list': Creative[];
  'creative.create': Creative;
  'creative.update': Creative;
  'creative.setStatus': Creative;
  'creative.versions': CreativeVersion[];
  'creative.delete': void;
  'asset.import': Asset[];
  'asset.list': Asset[];
  'asset.updateTags': Asset;
  'asset.delete': void;
  'asset.export': { savedTo: string | null };
  'campaign.list': Campaign[];
  'campaign.create': Campaign;
  'campaign.update': Campaign;
  'campaign.delete': void;
  'campaign.preflight': PublishCheck;
  'campaign.publish': Campaign;
  'campaign.setRemoteStatus': Campaign;
  'campaign.updateRemoteBudget': Campaign;
  'campaign.operations': PlatformOperation[];
  'search.adGroups': SearchAdGroup[];
  'search.saveAdGroup': SearchAdGroup;
  'search.deleteAdGroup': void;
  'search.pushAdGroup': SearchAdGroup;
  'search.keywordIdeasGoogle': KeywordIdeasResult;
  'search.keywordIdeasAi': KeywordIdeasResult;
  'search.adFromPage': SearchAdDraft;
  'publishing.getLimits': PublishingLimits;
  'publishing.saveLimits': PublishingLimits;
  'asset.uploadToPlatform': { remoteId: string };
  'dashboard.summary': DashboardSummary;
  'integration.list': IntegrationView[];
  'integration.meta.save': IntegrationView;
  'integration.meta.test': IntegrationView;
  'integration.meta.syncAccounts': AdvertisingAccount[];
  'integration.meta.syncCampaigns': SyncResult;
  'integration.meta.syncInsights': SyncResult;
  'integration.google.save': IntegrationView;
  'integration.google.authorize': IntegrationView;
  'integration.google.syncAccounts': AdvertisingAccount[];
  'integration.google.syncCampaigns': SyncResult;
  'integration.google.syncInsights': SyncResult;
  'integration.disconnect': IntegrationView;
  'brain.report': CreativeBrainReport;
  'brain.sync': { imported: number; message: string };
  'brain.tag': { tagged: number; remaining: number; model: string | null };
  'brain.playbook': CreativeBrainReport;
  'brain.setUseLearnings': CreativeBrainReport;
  'brain.ads': AdPerformance[];
  'autopilot.overview': AutopilotOverview;
  'autopilot.saveSettings': AutopilotOverview;
  'autopilot.run': AutopilotRunResult;
  'autopilot.apply': { applied: number; failed: Array<{ id: string; error: string }> };
  'autopilot.dismiss': AutopilotOverview;
  'factory.run': FactoryResult;
  'campaign.deleteRemote': Campaign;
  'campaign.removeLocal': void;
  'meta.adSets': MetaAdSet[];
  'meta.saveAdSet': MetaAdSet;
  'meta.deleteAdSet': void;
  'meta.pushAdSet': MetaAdSet;
  'meta.assetsOptions': MetaAssetsOptions;
  'meta.adSetFromCreatives': MetaAdSet;
  'intelligence.get': IntelligenceReport;
  'intelligence.run': IntelligenceReport;
  'recommendation.setStatus': Recommendation;
  'experiment.list': Experiment[];
  'experiment.create': Experiment;
  'experiment.update': Experiment;
  'experiment.importMetrics': Experiment;
  'experiment.evaluate': Experiment;
  'experiment.conclude': Experiment;
  'experiment.setStatus': Experiment;
  'experiment.delete': void;
  'automation.overview': AutomationOverview;
  'automation.create': AutomationRule;
  'automation.update': AutomationRule;
  'automation.delete': void;
  'automation.setEnabled': AutomationRule;
  'automation.simulate': AutomationSimulation;
  'automation.runNow': { matched: number; created: number; skipped: number; message: string };
  'automation.decide': AutomationExecution;
  'automation.killSwitch': AutomationOverview;
  'notification.list': AppNotification[];
  'notification.unread': number;
  'notification.markRead': number;
  'report.list': ReportSummary[];
  'report.create': Report;
  'report.get': Report;
  'report.delete': void;
  'report.export': { savedTo: string | null };
  'calendar.list': CalendarItem[];
  'calendar.create': { id: string };
  'calendar.update': void;
  'calendar.delete': void;
  'competitor.list': Competitor[];
  'competitor.create': Competitor;
  'competitor.update': Competitor;
  'competitor.delete': void;
  'competitor.capture': CompetitorReference;
  'competitor.classify': CompetitorReference;
  'competitor.classifyAi': CompetitorReference;
  'competitor.deleteReference': void;
  'competitor.analyze': CompetitiveAnalysis;
  'competitor.latestAnalysis': CompetitiveAnalysis | null;
  'audit.list': AuditEntry[];
}

export type ErrorCode =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'NOT_CONFIGURED'
  | 'EXTERNAL_API'
  | 'NETWORK'
  | 'CANCELLED'
  | 'INTERNAL';

export interface IpcError {
  code: ErrorCode;
  message: string;
  correlationId: string;
  fieldErrors?: Record<string, string[]>;
}

export type IpcResult<T> = { ok: true; data: T } | { ok: false; error: IpcError };

export { IPC_CHANNEL, CHANNEL_NAMES } from './channels';
