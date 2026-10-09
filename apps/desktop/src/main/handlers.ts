import { copyFileSync, writeFileSync } from 'node:fs';
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

    'campaign.preflight': ({ organizationId, id, accountId }, ctx) => core.preflightPublish(ctx, organizationId, id, accountId),
    'campaign.publish': ({ organizationId, id, accountId }, ctx) => core.publishCampaign(ctx, organizationId, id, accountId),
    'campaign.setRemoteStatus': ({ organizationId, id, status }, ctx) => core.setCampaignRemoteStatus(ctx, organizationId, id, status),
    'campaign.updateRemoteBudget': ({ organizationId, id, amount }, ctx) => core.updateCampaignRemoteBudget(ctx, organizationId, id, amount),
    'campaign.operations': ({ organizationId, id }, ctx) => core.listPlatformOperations(ctx, organizationId, id),
    'publishing.getLimits': ({ organizationId }, ctx) => core.getPublishingLimits(ctx, organizationId),
    'publishing.saveLimits': ({ organizationId, limits }, ctx) => core.savePublishingLimits(ctx, organizationId, limits),
    'asset.uploadToPlatform': ({ organizationId, id, accountId }, ctx) => core.uploadAssetToPlatform(ctx, organizationId, id, accountId),

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

    'experiment.list': ({ organizationId }, ctx) => core.listExperiments(ctx, organizationId),
    'experiment.create': ({ organizationId, data }, ctx) => core.createExperiment(ctx, organizationId, data),
    'experiment.update': ({ organizationId, id, data }, ctx) => core.updateExperiment(ctx, organizationId, id, data),
    'experiment.importMetrics': ({ organizationId, id }, ctx) => core.importExperimentMetrics(ctx, organizationId, id),
    'experiment.evaluate': ({ organizationId, id }, ctx) => core.evaluateExperimentById(ctx, organizationId, id),
    'experiment.conclude': ({ organizationId, id, conclusion }, ctx) => core.concludeExperiment(ctx, organizationId, id, conclusion),
    'experiment.setStatus': ({ organizationId, id, status }, ctx) => core.setExperimentStatus(ctx, organizationId, id, status),
    'experiment.delete': ({ organizationId, id }, ctx) => core.deleteExperiment(ctx, organizationId, id),

    'automation.overview': ({ organizationId }, ctx) => core.getAutomationOverview(ctx, organizationId),
    'automation.create': ({ organizationId, data }, ctx) => core.createRule(ctx, organizationId, data),
    'automation.update': ({ organizationId, id, data }, ctx) => core.updateRule(ctx, organizationId, id, data),
    'automation.delete': ({ organizationId, id }, ctx) => core.deleteRule(ctx, organizationId, id),
    'automation.setEnabled': ({ organizationId, id, enabled }, ctx) => core.setRuleEnabled(ctx, organizationId, id, enabled),
    'automation.simulate': ({ organizationId, data }, ctx) => core.simulateRule(ctx, organizationId, data),
    'automation.runNow': ({ organizationId, id }, ctx) => core.runRule(ctx, organizationId, id),
    'automation.decide': ({ organizationId, executionId, decision }, ctx) => core.decideApproval(ctx, organizationId, executionId, decision),
    'automation.killSwitch': ({ organizationId, active }, ctx) => core.setKillSwitch(ctx, organizationId, active),
    'notification.list': ({ organizationId }, ctx) => core.listNotifications(ctx, organizationId),
    'notification.unread': ({ organizationId }, ctx) => core.unreadNotifications(ctx, organizationId),
    'notification.markRead': ({ organizationId, ids }, ctx) => core.markNotificationsRead(ctx, organizationId, ids),

    'report.list': ({ organizationId }, ctx) => core.listReports(ctx, organizationId),
    'report.create': ({ organizationId, data }, ctx) => core.createReport(ctx, organizationId, data),
    'report.get': ({ organizationId, id }, ctx) => core.getReport(ctx, organizationId, id),
    'report.delete': ({ organizationId, id }, ctx) => core.deleteReport(ctx, organizationId, id),
    'report.export': async ({ organizationId, id, format }, ctx, event) => {
      const report = core.getReport(ctx, organizationId, id);
      const win = BrowserWindow.fromWebContents(event.sender);
      const base = `${report.title.replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80)} (${report.periodFrom} a ${report.periodTo})`;
      const opts: Electron.SaveDialogOptions = {
        title: format === 'pdf' ? 'Exportar relatório em PDF' : 'Exportar relatório em CSV',
        defaultPath: `${base}.${format}`,
        filters: [format === 'pdf' ? { name: 'PDF', extensions: ['pdf'] } : { name: 'CSV (Excel)', extensions: ['csv'] }],
      };
      const res = win ? await dialog.showSaveDialog(win, opts) : await dialog.showSaveDialog(opts);
      if (res.canceled || !res.filePath) return { savedTo: null };
      if (format === 'csv') writeFileSync(res.filePath, core.reportToCsv(report), 'utf8');
      else writeFileSync(res.filePath, await renderPdf(core.reportToHtml(report)));
      core.recordReportExport(ctx, organizationId, id, format);
      return { savedTo: res.filePath };
    },

    'calendar.list': ({ organizationId, from, to }, ctx) => core.listCalendar(ctx, organizationId, from, to),
    'calendar.create': ({ organizationId, data }, ctx) => ({ id: core.createCalendarEvent(ctx, organizationId, data) }),
    'calendar.update': ({ organizationId, id, data }, ctx) => core.updateCalendarEvent(ctx, organizationId, id, data),
    'calendar.delete': ({ organizationId, id }, ctx) => core.deleteCalendarEvent(ctx, organizationId, id),

    'audit.list': ({ organizationId, limit }, ctx) => core.listAudit(ctx, organizationId, limit),
  };
}

/**
 * Renderiza HTML autocontido em PDF A4 numa janela oculta, sem JavaScript e
 * em sandbox (o HTML não referencia recursos externos; a CSP do documento
 * também bloqueia qualquer carregamento).
 */
async function renderPdf(html: string): Promise<Buffer> {
  const win = new BrowserWindow({ show: false, webPreferences: { javascript: false, sandbox: true, contextIsolation: true, nodeIntegration: false } });
  try {
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    return await win.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate:
        '<div style="width:100%;font-size:8px;color:#5b6275;padding:0 14mm;display:flex;justify-content:space-between"><span>ADVERTEX AI Studio</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>',
      margins: { top: 0.6, bottom: 0.7, left: 0.55, right: 0.55 },
    });
  } finally {
    win.destroy();
  }
}
