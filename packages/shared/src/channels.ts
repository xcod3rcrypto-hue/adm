/**
 * Lista de canais IPC sem dependências (usada pelo preload em sandbox, que não
 * pode carregar módulos externos). Um teste garante que ela é idêntica às
 * chaves de `ipcInputs`.
 */
export const IPC_CHANNEL = 'advertex:invoke';

export const CHANNEL_NAMES = [
  'app.getInfo', 'app.openPath', 'app.openExternal',
  'onboarding.getState',
  'org.list', 'org.create', 'org.rename', 'org.getActive', 'org.setActive',
  'demo.enable', 'demo.disable',
  'client.list', 'client.create',
  'project.list', 'project.get', 'project.create', 'project.update', 'project.delete',
  'brief.get', 'brief.save', 'brief.versions', 'brief.restore', 'brief.analyzeUrl', 'brief.generateInsights',
  'ai.getConfig', 'ai.saveConfig', 'ai.clearKey', 'ai.test',
  'studio.generate',
  'creative.list', 'creative.create', 'creative.update', 'creative.setStatus', 'creative.versions', 'creative.delete',
  'asset.import', 'asset.list', 'asset.updateTags', 'asset.delete', 'asset.export',
  'campaign.list', 'campaign.create', 'campaign.update', 'campaign.delete',
  'campaign.preflight', 'campaign.publish', 'campaign.setRemoteStatus', 'campaign.updateRemoteBudget', 'campaign.operations',
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
  'audit.list',
] as const;
