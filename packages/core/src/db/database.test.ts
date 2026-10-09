import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Database } from './database';
import { MIGRATIONS } from './migrations';

describe('Database', () => {
  it('aplica todas as migrações e cria as tabelas do domínio', async () => {
    const db = await Database.open(null);
    expect(db.schemaVersion).toBe(MIGRATIONS.at(-1)!.version);
    const tables = db.all<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table'").map((t) => t.name);
    for (const t of [
      'users', 'organizations', 'memberships', 'clients', 'projects', 'brand_profiles', 'briefs', 'brief_versions',
      'integration_connections', 'advertising_accounts', 'campaigns', 'ad_groups', 'ads', 'creatives', 'assets',
      'metric_snapshots', 'insights', 'recommendations', 'experiments', 'automation_rules', 'automation_executions',
      'approvals', 'audit_logs', 'reports', 'notifications', 'ai_jobs',
    ]) {
      expect(tables).toContain(t);
    }
  });

  it('persiste em disco de forma atômica e reabre com os dados', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'advertex-db-'));
    const file = join(dir, 'data.sqlite');
    const db = await Database.open(file);
    db.run("INSERT INTO settings (key, value, updated_at) VALUES ('k', '\"v\"', 'now')");
    db.close();
    expect(existsSync(file)).toBe(true);
    expect(existsSync(`${file}.tmp`)).toBe(false);

    const reopened = await Database.open(file);
    expect(reopened.get<{ value: string }>("SELECT value FROM settings WHERE key = 'k'")?.value).toBe('"v"');
    expect(existsSync(`${file}.bak`)).toBe(true);
  });

  it('desfaz a transação inteira quando ocorre erro', async () => {
    const db = await Database.open(null);
    expect(() =>
      db.transaction(() => {
        db.run("INSERT INTO settings (key, value, updated_at) VALUES ('a', '1', 'now')");
        throw new Error('falha');
      }),
    ).toThrow('falha');
    expect(db.get("SELECT 1 FROM settings WHERE key = 'a'")).toBeUndefined();
  });

  it('mantém chaves estrangeiras ativas mesmo após gravar em disco', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'advertex-db-'));
    const db = await Database.open(join(dir, 'fk.sqlite'));
    db.run("INSERT INTO organizations (id, name, created_at, updated_at) VALUES ('o1', 'Org', 'n', 'n')");
    db.persist();
    expect(() =>
      db.run("INSERT INTO projects (id, organization_id, name, created_at, updated_at) VALUES ('p1', 'inexistente', 'P', 'n', 'n')"),
    ).toThrow(/FOREIGN KEY/);
  });
});
