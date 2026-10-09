import { AppError, ProjectInput, ClientInput, type Client, type Project } from '@advertex/shared';
import type { AppContext } from '../context';
import { requireOrg, requireOwned } from '../util';
import { recordAudit } from './audit';

interface ProjectRow {
  id: string;
  organization_id: string;
  client_id: string | null;
  client_name: string | null;
  name: string;
  description: string;
  objective: string;
  status: Project['status'];
  created_at: string;
  updated_at: string;
}

const toProject = (r: ProjectRow): Project => ({
  id: r.id,
  organizationId: r.organization_id,
  clientId: r.client_id,
  clientName: r.client_name,
  name: r.name,
  description: r.description,
  objective: r.objective,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const SELECT = `SELECT p.*, c.name AS client_name FROM projects p LEFT JOIN clients c ON c.id = p.client_id`;

export function listClients(ctx: AppContext, organizationId: string): Client[] {
  requireOrg(ctx, organizationId);
  return ctx.db
    .all<{ id: string; organization_id: string; name: string; notes: string; created_at: string }>(
      'SELECT * FROM clients WHERE organization_id = ? ORDER BY name COLLATE NOCASE',
      [organizationId],
    )
    .map((r) => ({ id: r.id, organizationId: r.organization_id, name: r.name, notes: r.notes, createdAt: r.created_at }));
}

export function createClient(ctx: AppContext, organizationId: string, raw: unknown): Client {
  requireOrg(ctx, organizationId);
  const data = ClientInput.parse(raw);
  const id = ctx.newId();
  const now = ctx.now();
  ctx.db.run('INSERT INTO clients (id, organization_id, name, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', [id, organizationId, data.name, data.notes, now, now]);
  recordAudit(ctx, { organizationId, action: 'client.create', entityType: 'client', entityId: id, details: { name: data.name } });
  return { id, organizationId, name: data.name, notes: data.notes, createdAt: now };
}

export function listProjects(ctx: AppContext, organizationId: string, includeArchived = false): Project[] {
  requireOrg(ctx, organizationId);
  return ctx.db
    .all<ProjectRow>(`${SELECT} WHERE p.organization_id = ? ${includeArchived ? '' : "AND p.status != 'archived'"} ORDER BY p.updated_at DESC`, [organizationId])
    .map(toProject);
}

export function getProject(ctx: AppContext, organizationId: string, id: string): Project {
  const row = ctx.db.get<ProjectRow>(`${SELECT} WHERE p.id = ? AND p.organization_id = ?`, [id, organizationId]);
  if (!row) throw new AppError('NOT_FOUND', 'Projeto não encontrado.');
  return toProject(row);
}

export function createProject(ctx: AppContext, organizationId: string, raw: unknown): Project {
  requireOrg(ctx, organizationId);
  const data = ProjectInput.parse(raw);
  if (data.clientId) requireOwned(ctx, 'clients', data.clientId, organizationId, 'Cliente');
  const id = ctx.newId();
  const now = ctx.now();
  ctx.db.run(
    'INSERT INTO projects (id, organization_id, client_id, name, description, objective, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, organizationId, data.clientId, data.name, data.description, data.objective, data.status, now, now],
  );
  recordAudit(ctx, { organizationId, action: 'project.create', entityType: 'project', entityId: id, details: { name: data.name } });
  return getProject(ctx, organizationId, id);
}

export function updateProject(ctx: AppContext, organizationId: string, id: string, raw: unknown): Project {
  getProject(ctx, organizationId, id);
  const data = ProjectInput.parse(raw);
  if (data.clientId) requireOwned(ctx, 'clients', data.clientId, organizationId, 'Cliente');
  ctx.db.run(
    'UPDATE projects SET client_id = ?, name = ?, description = ?, objective = ?, status = ?, updated_at = ? WHERE id = ? AND organization_id = ?',
    [data.clientId, data.name, data.description, data.objective, data.status, ctx.now(), id, organizationId],
  );
  recordAudit(ctx, { organizationId, action: 'project.update', entityType: 'project', entityId: id, details: { name: data.name, status: data.status } });
  return getProject(ctx, organizationId, id);
}

export function deleteProject(ctx: AppContext, organizationId: string, id: string): void {
  const p = getProject(ctx, organizationId, id);
  ctx.db.run('DELETE FROM projects WHERE id = ? AND organization_id = ?', [id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'project.delete', entityType: 'project', entityId: id, details: { name: p.name } });
}
