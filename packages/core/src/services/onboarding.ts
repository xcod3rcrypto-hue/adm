import type { OnboardingState } from '@advertex/shared';
import type { AppContext } from '../context';
import { hasSecret, scopes } from './secrets';
import { getSetting } from './settings';

export function onboardingState(ctx: AppContext, organizationId: string | null): OnboardingState {
  const realOrgs = ctx.db.get<{ n: number }>('SELECT COUNT(*) AS n FROM organizations WHERE is_demo = 0')?.n ?? 0;
  const count = (sql: string) => (organizationId ? (ctx.db.get<{ n: number }>(sql, [organizationId])?.n ?? 0) : 0);
  const conn = (platform: string) =>
    organizationId
      ? !!ctx.db.get("SELECT 1 AS ok FROM integration_connections WHERE organization_id = ? AND platform = ? AND state = 'connected'", [organizationId, platform])
      : false;
  const ai = getSetting<{ provider: string }>(ctx, 'ai.config', { provider: 'anthropic' });
  return {
    hasOrganization: realOrgs > 0,
    checklist: {
      organization: realOrgs > 0,
      project: count('SELECT COUNT(*) AS n FROM projects WHERE organization_id = ?') > 0,
      brief: count('SELECT COUNT(*) AS n FROM briefs WHERE organization_id = ?') > 0,
      ai: hasSecret(ctx, scopes.aiKey(ai.provider)),
      meta: conn('meta'),
      google: conn('google'),
    },
  };
}
