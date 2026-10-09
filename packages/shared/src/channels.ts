/**
 * Lista de canais IPC sem dependências (usada pelo preload em sandbox, que não
 * pode carregar módulos externos). Um teste garante que ela é idêntica às
 * chaves de `ipcInputs`.
 */
export const IPC_CHANNEL = 'advertex:invoke';

export const CHANNEL_NAMES = [
  'app.getInfo', 'app.openPath', 'app.openExternal', 'app.updateStatus', 'app.checkUpdates', 'app.downloadUpdate', 'app.installUpdate',
  'onboarding.getState',
  'org.list', 'org.create', 'org.rename', 'org.getActive', 'org.setActive',
  'demo.enable', 'demo.disable',
  'client.list', 'client.create',
  'project.list', 'project.get', 'project.create', 'project.update', 'project.delete',
  'brief.get', 'brief.save', 'brief.versions', 'brief.restore', 'brief.analyzeUrl', 'brief.generateInsights',
  'ai.getConfig', 'ai.saveConfig', 'ai.clearKey', 'ai.test',
  'image.getConfig', 'image.saveConfig', 'image.clearKey', 'image.test', 'image.generate',
  'studio.generate',
  'creative.list', 'creative.create', 'creative.update', 'creative.setStatus', 'creative.versions', 'creative.delete',
  'asset.import', 'asset.list', 'asset.updateTags', 'asset.delete', 'asset.export',
  'campaign.list', 'campaign.create', 'campaign.update', 'campaign.delete',
  'campaign.preflight', 'campaign.publish', 'campaign.setRemoteStatus', 'campaign.updateRemoteBudget', 'campaign.operations',
  'search.adGroups', 'search.saveAdGroup', 'search.deleteAdGroup', 'search.pushAdGroup', 'search.keywordIdeasGoogle', 'search.keywordIdeasAi', 'search.adFromPage',
  'publishing.getLimits', 'publishing.saveLimits', 'asset.uploadToPlatform',
  'dashboard.summary',
  'integration.list',
  'integration.meta.save', 'integration.meta.test', 'integration.meta.syncAccounts', 'integration.meta.syncCampaigns', 'integration.meta.syncInsights',
  'integration.google.save', 'integration.google.authorize', 'integration.google.syncAccounts', 'integration.google.syncCampaigns', 'integration.google.syncInsights',
  'integration.disconnect',
  'intelligence.get', 'intelligence.run', 'recommendation.setStatus',
  'experiment.list', 'experiment.create', 'experiment.update', 'experiment.importMetrics', 'experiment.evaluate', 'experiment.conclude', 'experiment.setStatus', 'experiment.delete',
  'automation.overview', 'automation.create', 'automation.update', 'automation.delete', 'automation.setEnabled', 'automation.simulate', 'automation.runNow', 'automation.decide', 'automation.killSwitch',
  'notification.list', 'notification.unread', 'notification.markRead',
  'report.list', 'report.create', 'report.get', 'report.delete', 'report.export',
  'calendar.list', 'calendar.create', 'calendar.update', 'calendar.delete',
  'competitor.list', 'competitor.create', 'competitor.update', 'competitor.delete', 'competitor.capture', 'competitor.classify', 'competitor.classifyAi', 'competitor.deleteReference', 'competitor.analyze', 'competitor.latestAnalysis',
  'audit.list',
] as const;
