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
    loginCustomerId: z.string().trim().regex(/^(\d{10})?$/, 'Somente 10 dígitos, sem hífens').default(''),
    apiVersion: z.string().regex(/^v\d+$/, 'Formato: v25'),
  }),
  'integration.google.authorize': z.object(org),
  'integration.google.syncAccounts': z.object(org),
  'integration.google.syncCampaigns': z.object({ ...org, accountId: Id }),
  'integration.google.syncInsights': z.object({ ...org, accountId: Id, from: isoDate, to: isoDate }),
  'integration.disconnect': z.object({ ...org, platform: Platform }),

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
