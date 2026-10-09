/**
 * Migrações versionadas e imutáveis: nunca edite uma migração já publicada,
 * crie uma nova. Datas em ISO-8601 UTC (TEXT); JSON em TEXT.
 * Estratégia de exclusão:
 *  - Dados de uma organização são apagados em cascata com ela.
 *  - Remover um projeto desvincula campanhas/criativos/ativos (SET NULL) — o
 *    histórico de mídia não deve sumir junto com um projeto.
 *  - audit_logs não tem FK: a trilha de auditoria sobrevive à exclusão.
 */
export interface Migration {
  version: number;
  name: string;
  sql: string;
}

const m001 = `
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE memberships (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TEXT NOT NULL,
  UNIQUE (organization_id, user_id)
);

CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_clients_org ON clients(organization_id);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  objective TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_projects_org ON projects(organization_id, status);

CREATE TABLE brand_profiles (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT '',
  colors TEXT NOT NULL DEFAULT '[]',
  fonts TEXT NOT NULL DEFAULT '[]',
  guidelines TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_brand_profiles_org ON brand_profiles(organization_id);

CREATE TABLE briefs (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  current_version INTEGER NOT NULL,
  data TEXT NOT NULL,
  insights TEXT,
  insights_generated_at TEXT,
  insights_model TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE brief_versions (
  id TEXT PRIMARY KEY,
  brief_id TEXT NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  data TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  UNIQUE (brief_id, version)
);

CREATE TABLE integration_connections (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
  state TEXT NOT NULL CHECK (state IN ('not_configured', 'configured', 'connected', 'error')),
  api_version TEXT NOT NULL,
  config TEXT NOT NULL DEFAULT '{}',
  identity TEXT,
  last_checked_at TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organization_id, platform)
);

CREATE TABLE secrets (
  scope TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  ciphertext BLOB NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE advertising_accounts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connection_id TEXT NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
  remote_id TEXT NOT NULL,
  name TEXT NOT NULL,
  currency TEXT,
  timezone TEXT,
  status TEXT,
  last_synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organization_id, platform, remote_id)
);

CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  advertising_account_id TEXT REFERENCES advertising_accounts(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
  remote_id TEXT,
  name TEXT NOT NULL,
  objective TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'removed', 'unknown')),
  daily_budget REAL CHECK (daily_budget IS NULL OR daily_budget >= 0),
  currency TEXT NOT NULL DEFAULT 'BRL',
  start_date TEXT,
  end_date TEXT,
  notes TEXT NOT NULL DEFAULT '',
  sync_state TEXT NOT NULL CHECK (sync_state IN ('local_only', 'synced', 'pending', 'error')),
  last_synced_at TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (organization_id, platform, remote_id)
);
CREATE INDEX idx_campaigns_org ON campaigns(organization_id, platform);

CREATE TABLE ad_groups (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
  remote_id TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  settings TEXT NOT NULL DEFAULT '{}',
  sync_state TEXT NOT NULL DEFAULT 'local_only',
  last_synced_at TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_ad_groups_campaign ON ad_groups(campaign_id);

CREATE TABLE creatives (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  platform TEXT CHECK (platform IS NULL OR platform IN ('meta', 'google')),
  funnel_stage TEXT,
  body TEXT NOT NULL,
  cta TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  asset_ids TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'rejected')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai')),
  ai_job_id TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_creatives_org ON creatives(organization_id, project_id);

CREATE TABLE creative_versions (
  id TEXT PRIMARY KEY,
  creative_id TEXT NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cta TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  UNIQUE (creative_id, version)
);

CREATE TABLE ads (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ad_group_id TEXT NOT NULL REFERENCES ad_groups(id) ON DELETE CASCADE,
  creative_id TEXT REFERENCES creatives(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
  remote_id TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  sync_state TEXT NOT NULL DEFAULT 'local_only',
  last_synced_at TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_ads_group ON ads(ad_group_id);

CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  stored_name TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);
CREATE INDEX idx_assets_org ON assets(organization_id, project_id);

CREATE TABLE metric_snapshots (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
  date TEXT NOT NULL,
  currency TEXT NOT NULL,
  spend REAL NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  reach INTEGER,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions REAL NOT NULL DEFAULT 0,
  revenue REAL,
  source TEXT NOT NULL CHECK (source IN ('demo', 'meta', 'google')),
  definition TEXT NOT NULL DEFAULT '',
  fetched_at TEXT NOT NULL,
  UNIQUE (campaign_id, date, source)
);
CREATE INDEX idx_metrics_org_date ON metric_snapshots(organization_id, date);

CREATE TABLE insights (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '{}',
  evidence TEXT NOT NULL DEFAULT '[]',
  period_from TEXT,
  period_to TEXT,
  confidence REAL,
  created_at TEXT NOT NULL
);

CREATE TABLE recommendations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  insight_id TEXT REFERENCES insights(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  rationale TEXT NOT NULL,
  evidence TEXT NOT NULL DEFAULT '[]',
  confidence REAL,
  impact TEXT,
  risks TEXT,
  limitations TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'dismissed', 'done')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE experiments (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  hypothesis TEXT NOT NULL,
  variable TEXT NOT NULL,
  primary_metric TEXT NOT NULL,
  variant_creative_ids TEXT NOT NULL DEFAULT '[]',
  period_from TEXT,
  period_to TEXT,
  decision_criteria TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'running', 'concluded', 'inconclusive', 'cancelled')),
  result TEXT,
  conclusion TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE automation_rules (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('read_only', 'recommend', 'approve', 'auto_limited')),
  trigger_def TEXT NOT NULL DEFAULT '{}',
  conditions TEXT NOT NULL DEFAULT '[]',
  action TEXT NOT NULL DEFAULT '{}',
  evaluation_window TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL DEFAULT '',
  max_spend REAL,
  expires_at TEXT,
  enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE automation_executions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('simulated', 'pending_approval', 'running', 'succeeded', 'failed', 'cancelled')),
  simulated INTEGER NOT NULL DEFAULT 1,
  request TEXT NOT NULL DEFAULT '{}',
  result TEXT,
  remote_id TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  finished_at TEXT
);

CREATE TABLE approvals (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  requested_by TEXT,
  decided_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  reason TEXT,
  created_at TEXT NOT NULL,
  decided_at TEXT
);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failure')),
  details TEXT NOT NULL DEFAULT '{}',
  correlation_id TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_audit_org ON audit_logs(organization_id, created_at);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  period_from TEXT NOT NULL,
  period_to TEXT NOT NULL,
  filters TEXT NOT NULL DEFAULT '{}',
  content TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  read_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE ai_jobs (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
  input_tokens INTEGER,
  output_tokens INTEGER,
  error TEXT,
  created_at TEXT NOT NULL,
  finished_at TEXT
);
CREATE INDEX idx_ai_jobs_org ON ai_jobs(organization_id, created_at);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

export const MIGRATIONS: Migration[] = [{ version: 1, name: 'initial_schema', sql: m001 }];
