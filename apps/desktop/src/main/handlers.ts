import { copyFileSync } from 'node:fs';
import { BrowserWindow, app, dialog, shell } from 'electron';
import { AppError } from '@advertex/shared';
import * as core from '@advertex/core';
import type { HandlerMap } from './ipc';

export interface AppPaths {
  userData: string;
  logs: string;
  database: string;
}

/** Domínios que a interface pode abrir no navegador (documentação e consoles oficiais). */
const EXTERNAL_ALLOWLIST = [
  'developers.facebook.com',
  'business.facebook.com',
  'developers.google.com',
  'ads.google.com',
  'console.cloud.google.com',
  'myaccount.google.com',
  'console.anthropic.com',
  'platform.claude.com',
  'docs.claude.com',
  'docs.anthropic.com',
];

export function isAllowedExternal(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && EXTERNAL_ALLOWLIST.some((d) => u.hostname === d || u.hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export function createHandlers(paths: AppPaths): HandlerMap {
  return {
    'app.getInfo': () => ({
      name: app.getName(),
      version: app.getVersion(),
      electron: process.versions.electron ?? '',
      platform: `${process.platform} ${process.arch}`,
      isPackaged: app.isPackaged,
      userDataPath: paths.userData,
      logsPath: paths.logs,
      databasePath: paths.database,
    }),
    'app.openPath': async ({ target }) => {
      const err = await shell.openPath(target === 'logs' ? paths.logs : paths.userData);
      if (err) throw new AppError('INTERNAL', `Não foi possível abrir a pasta: ${err}`);
    },
    'app.openExternal': async ({ url }) => {
      if (!isAllowedExternal(url)) throw new AppError('FORBIDDEN', 'Link externo não permitido.');
      await shell.openExternal(url);
    },

    'onboarding.getState': ({ organizationId }, ctx) => core.onboardingState(ctx, organizationId),

    'org.list': (_i, ctx) => core.listOrganizations(ctx),
    'org.create': (input, ctx) => {
      const org = core.createOrganization(ctx, input);
      return core.setActiveOrganization(ctx, org.id);
    },
    'org.rename': ({ organizationId, name }, ctx) => core.renameOrganization(ctx, organizationId, name),
    'org.getActive': (_i, ctx) => core.getActiveOrganization(ctx),
    'org.setActive': ({ organizationId }, ctx) => core.setActiveOrganization(ctx, organizationId),

    'demo.enable': (_i, ctx) => core.enableDemo(ctx),
    'demo.disable': (_i, ctx) => core.disableDemo(ctx),

    'client.list': ({ organizationId }, ctx) => core.listClients(ctx, organizationId),
    'client.create': ({ organizationId, data }, ctx) => core.createClient(ctx, organizationId, data),

    'project.list': ({ organizationId, includeArchived }, ctx) => core.listProjects(ctx, organizationId, includeArchived),
    'project.get': ({ organizationId, id }, ctx) => core.getProject(ctx, organizationId, id),
    'project.create': ({ organizationId, data }, ctx) => core.createProject(ctx, organizationId, data),
    'project.update': ({ organizationId, id, data }, ctx) => core.updateProject(ctx, organizationId, id, data),
    'project.delete': ({ organizationId, id }, ctx) => core.deleteProject(ctx, organizationId, id),

    'brief.get': ({ organizationId, projectId }, ctx) => core.getBrief(ctx, organizationId, projectId),
    'brief.save': ({ organizationId, projectId, data, note }, ctx) => core.saveBrief(ctx, organizationId, projectId, data, note),
    'brief.versions': ({ organizationId, projectId }, ctx) => core.listBriefVersions(ctx, organizationId, projectId),
    'brief.restore': ({ organizationId, projectId, versionId }, ctx) => core.restoreBriefVersion(ctx, organizationId, projectId, versionId),
    'brief.analyzeUrl': async ({ organizationId, url }, ctx) => {
      core.getOrganization(ctx, organizationId);
      try {
        const page = await core.fetchPublicPage(url);
        core.recordAudit(ctx, { organizationId, action: 'brief.analyzeUrl', entityType: 'url', details: { host: new URL(page.finalUrl).hostname } });
        return page;
      } catch (err) {
        throw new AppError('EXTERNAL_API', err instanceof Error ? err.message : 'Falha ao analisar a página.', { cause: err });
      }
    },
    'brief.generateInsights': async ({ organizationId, projectId }, ctx) => {
      const brief = core.getBrief(ctx, organizationId, projectId);
      let excerpt: string | null = null;
      if (brief?.data.websiteUrl) {
        // Melhor esforço: a análise segue sem o site se ele estiver inacessível.
        excerpt = await core
          .fetchPublicPage(brief.data.websiteUrl)
          .then((p) => [p.title, p.description, ...p.headings, p.textExcerpt].filter(Boolean).join('\n'))
          .catch((e: unknown) => {
            ctx.logger.warn('Falha ao ler site do briefing', { error: e instanceof Error ? e.message : String(e) });
            return null;
          });
      }
      return core.generateBriefInsights(ctx, organizationId, projectId, excerpt);
    },

    'ai.getConfig': (_i, ctx) => core.getAiConfig(ctx),
    'ai.saveConfig': (input, ctx) => core.saveAiConfig(ctx, input),
    'ai.clearKey': (_i, ctx) => core.clearAiKey(ctx),
    'ai.test': (_i, ctx) => core.testAi(ctx),

    'studio.generate': ({ organizationId, request }, ctx) => core.generateVariations(ctx, organizationId, request),

    'creative.list': ({ organizationId, ...filter }, ctx) => core.listCreatives(ctx, organizationId, filter),
    'creative.create': ({ organizationId, data }, ctx) => core.createCreative(ctx, organizationId, data),
    'creative.update': ({ organizationId, id, data, note }, ctx) => core.updateCreative(ctx, organizationId, id, data, note),
    'creative.setStatus': ({ organizationId, id, status }, ctx) => core.setCreativeStatus(ctx, organizationId, id, status),
    'creative.versions': ({ organizationId, id }, ctx) => core.listCreativeVersions(ctx, organizationId, id),
    'creative.delete': ({ organizationId, id }, ctx) => core.deleteCreative(ctx, organizationId, id),

    'asset.import': async ({ organizationId, projectId }, ctx, event) => {
      core.getOrganization(ctx, organizationId);
      const win = BrowserWindow.fromWebContents(event.sender);
      const opts: Electron.OpenDialogOptions = {
        title: 'Importar ativos',
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Imagens e vídeos', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'mov', 'webm'] },
        ],
      };
      const res = win ? await dialog.showOpenDialog(win, opts) : await dialog.showOpenDialog(opts);
      if (res.canceled || res.filePaths.length === 0) return [];
      const r = core.importAssets(ctx, organizationId, projectId, res.filePaths.slice(0, 50));
      if (r.imported.length === 0 && r.skipped.length > 0) {
        throw new AppError('VALIDATION', r.skipped.map((s) => `${s.fileName}: ${s.reason}`).join(' '));
      }
      if (r.skipped.length > 0) ctx.logger.info('Ativos ignorados na importação', { skipped: r.skipped });
      return r.imported;
    },
    'asset.list': ({ organizationId, projectId, search }, ctx) => core.listAssets(ctx, organizationId, projectId, search),
    'asset.updateTags': ({ organizationId, id, tags }, ctx) => core.updateAssetTags(ctx, organizationId, id, tags),
    'asset.delete': ({ organizationId, id }, ctx) => core.deleteAsset(ctx, organizationId, id),
    'asset.export': async ({ organizationId, id }, ctx, event) => {
      const file = core.assetFilePath(ctx, organizationId, id);
      const win = BrowserWindow.fromWebContents(event.sender);
      const opts: Electron.SaveDialogOptions = { title: 'Exportar ativo', defaultPath: file.fileName };
      const res = win ? await dialog.showSaveDialog(win, opts) : await dialog.showSaveDialog(opts);
      if (res.canceled || !res.filePath) return { savedTo: null };
      copyFileSync(file.path, res.filePath);
      return { savedTo: res.filePath };
    },

    'campaign.list': ({ organizationId, platform }, ctx) => core.listCampaigns(ctx, organizationId, platform),
    'campaign.create': ({ organizationId, data }, ctx) => core.createCampaignDraft(ctx, organizationId, data),
    'campaign.update': ({ organizationId, id, data }, ctx) => core.updateCampaignDraft(ctx, organizationId, id, data),
    'campaign.delete': ({ organizationId, id }, ctx) => core.deleteCampaignDraft(ctx, organizationId, id),

    'dashboard.summary': ({ organizationId, from, to, platform }, ctx) => core.dashboardSummary(ctx, organizationId, from, to, platform),

    'integration.list': ({ organizationId }, ctx) => core.listIntegrations(ctx, organizationId),
    'integration.meta.save': ({ organizationId, ...input }, ctx) => core.saveMeta(ctx, organizationId, input),
    'integration.meta.test': ({ organizationId }, ctx) => core.testMeta(ctx, organizationId),
    'integration.meta.syncAccounts': ({ organizationId }, ctx) => core.syncAccounts(ctx, organizationId, 'meta'),
    'integration.meta.syncCampaigns': ({ organizationId, accountId }, ctx) => core.syncCampaigns(ctx, organizationId, 'meta', accountId),
    'integration.meta.syncInsights': ({ organizationId, accountId, from, to }, ctx) => core.syncInsights(ctx, organizationId, 'meta', accountId, { from, to }),
    'integration.google.save': ({ organizationId, ...input }, ctx) => core.saveGoogle(ctx, organizationId, input),
    'integration.google.authorize': ({ organizationId }, ctx) => core.authorizeGoogle(ctx, organizationId),
    'integration.google.syncAccounts': ({ organizationId }, ctx) => core.syncAccounts(ctx, organizationId, 'google'),
    'integration.google.syncCampaigns': ({ organizationId, accountId }, ctx) => core.syncCampaigns(ctx, organizationId, 'google', accountId),
    'integration.google.syncInsights': ({ organizationId, accountId, from, to }, ctx) => core.syncInsights(ctx, organizationId, 'google', accountId, { from, to }),
    'integration.disconnect': ({ organizationId, platform }, ctx) => core.disconnect(ctx, organizationId, platform),

    'intelligence.get': ({ organizationId }, ctx) => core.getIntelligence(ctx, organizationId),
    'intelligence.run': ({ organizationId, from, to, platform }, ctx) => core.runDiagnostics(ctx, organizationId, from, to, platform),
    'recommendation.setStatus': ({ organizationId, id, status }, ctx) => core.setRecommendationStatus(ctx, organizationId, id, status),

    'audit.list': ({ organizationId, limit }, ctx) => core.listAudit(ctx, organizationId, limit),
  };
}
