import { AppError, type Organization, type OrganizationInput } from '@advertex/shared';
import type { AppContext } from '../context';
import { bool, requireOrg } from '../util';
import { recordAudit } from './audit';
import { getSetting, setSetting } from './settings';

interface OrgRow {
  id: string;
  name: string;
  is_demo: number;
  created_at: string;
  updated_at: string;
}

const toOrg = (r: OrgRow): Organization => ({ id: r.id, name: r.name, isDemo: bool(r.is_demo), createdAt: r.created_at, updatedAt: r.updated_at });

/** Usuário local único da instalação desktop (base para multiusuário futuro). */
export function ensureLocalUser(ctx: AppContext): string {
  const row = ctx.db.get<{ id: string }>('SELECT id FROM users ORDER BY created_at LIMIT 1');
  if (row) return row.id;
  const id = ctx.newId();
  ctx.db.run('INSERT INTO users (id, display_name, created_at) VALUES (?, ?, ?)', [id, 'Usuário local', ctx.now()]);
  return id;
}

export function listOrganizations(ctx: AppContext): Organization[] {
  return ctx.db.all<OrgRow>('SELECT * FROM organizations ORDER BY is_demo ASC, created_at ASC').map(toOrg);
}

export function getOrganization(ctx: AppContext, id: string): Organization {
  requireOrg(ctx, id);
  return toOrg(ctx.db.get<OrgRow>('SELECT * FROM organizations WHERE id = ?', [id])!);
}

export function createOrganization(ctx: AppContext, input: OrganizationInput, opts: { isDemo?: boolean } = {}): Organization {
  return ctx.db.transaction(() => {
    const userId = ensureLocalUser(ctx);
    const id = ctx.newId();
    const now = ctx.now();
    ctx.db.run('INSERT INTO organizations (id, name, is_demo, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [id, input.name, opts.isDemo ? 1 : 0, now, now]);
    ctx.db.run("INSERT INTO memberships (id, organization_id, user_id, role, created_at) VALUES (?, ?, ?, 'owner', ?)", [ctx.newId(), id, userId, now]);
    recordAudit(ctx, { organizationId: id, action: 'organization.create', entityType: 'organization', entityId: id, details: { name: input.name, isDemo: !!opts.isDemo } });
    if (!getSetting<string | null>(ctx, 'activeOrganizationId', null)) setSetting(ctx, 'activeOrganizationId', id);
    return getOrganization(ctx, id);
  });
}

export function renameOrganization(ctx: AppContext, id: string, name: string): Organization {
  const org = requireOrg(ctx, id);
  if (bool(org.is_demo)) throw new AppError('FORBIDDEN', 'A organização de demonstração não pode ser renomeada.');
  ctx.db.run('UPDATE organizations SET name = ?, updated_at = ? WHERE id = ?', [name, ctx.now(), id]);
  recordAudit(ctx, { organizationId: id, action: 'organization.rename', entityType: 'organization', entityId: id, details: { name } });
  return getOrganization(ctx, id);
}

export function getActiveOrganization(ctx: AppContext): Organization | null {
  const id = getSetting<string | null>(ctx, 'activeOrganizationId', null);
  if (id) {
    const row = ctx.db.get<OrgRow>('SELECT * FROM organizations WHERE id = ?', [id]);
    if (row) return toOrg(row);
  }
  const first = ctx.db.get<OrgRow>('SELECT * FROM organizations ORDER BY is_demo ASC, created_at ASC LIMIT 1');
  if (first) setSetting(ctx, 'activeOrganizationId', first.id);
  return first ? toOrg(first) : null;
}

export function setActiveOrganization(ctx: AppContext, id: string): Organization {
  const org = getOrganization(ctx, id);
  setSetting(ctx, 'activeOrganizationId', id);
  return org;
}
