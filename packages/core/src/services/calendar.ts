import { AppError, CalendarEventInput, type CalendarItem, type CalendarStatus } from '@advertex/shared';
import type { AppContext } from '../context';
import { requireOrg, requireOwned } from '../util';
import { recordAudit } from './audit';

const SYNC_STATUS: Record<string, string> = {
  local_only: 'rascunho local',
  pending: 'publicação com resultado incerto',
  error: 'falha na publicação',
  synced: 'na plataforma',
};

interface EventRow {
  id: string;
  title: string;
  kind: CalendarItem['kind'];
  start_date: string;
  end_date: string | null;
  responsible: string;
  status: CalendarStatus;
  notes: string;
  project_id: string | null;
  project_name: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
}

/**
 * Itens do calendário no intervalo: eventos manuais + datas derivadas de
 * campanhas, experimentos e aprovações pendentes. Uma campanha com data de
 * início NÃO é tratada como publicada: o status mostra o estado real.
 */
export function listCalendar(ctx: AppContext, organizationId: string, from: string, to: string): CalendarItem[] {
  requireOrg(ctx, organizationId);
  if (to < from) throw new AppError('VALIDATION', 'Intervalo inválido.');
  const overlaps = (start: string, end: string | null) => start <= to && (end ?? start) >= from;

  const events = ctx.db
    .all<EventRow>(
      `SELECT e.*, p.name AS project_name, c.name AS campaign_name FROM calendar_events e
       LEFT JOIN projects p ON p.id = e.project_id LEFT JOIN campaigns c ON c.id = e.campaign_id
       WHERE e.organization_id = ? AND e.start_date <= ? AND COALESCE(e.end_date, e.start_date) >= ?`,
      [organizationId, to, from],
    )
    .map<CalendarItem>((e) => ({
      id: e.id,
      source: 'event',
      title: e.title,
      kind: e.kind,
      startDate: e.start_date,
      endDate: e.end_date,
      status: e.status,
      responsible: e.responsible,
      notes: e.notes,
      projectId: e.project_id,
      projectName: e.project_name,
      campaignId: e.campaign_id,
      campaignName: e.campaign_name,
    }));

  const campaigns = ctx.db
    .all<{ id: string; name: string; start_date: string | null; end_date: string | null; status: string; sync_state: string; project_id: string | null; project_name: string | null }>(
      `SELECT c.id, c.name, c.start_date, c.end_date, c.status, c.sync_state, c.project_id, p.name AS project_name
       FROM campaigns c LEFT JOIN projects p ON p.id = c.project_id WHERE c.organization_id = ? AND c.start_date IS NOT NULL`,
      [organizationId],
    )
    .filter((c) => overlaps(c.start_date!, c.end_date))
    .map<CalendarItem>((c) => ({
      id: `campaign:${c.id}`,
      source: 'campaign',
      title: c.name,
      kind: 'campaign',
      startDate: c.start_date!,
      endDate: c.end_date,
      status: `${c.status} · ${SYNC_STATUS[c.sync_state] ?? c.sync_state}`,
      responsible: '',
      notes: c.sync_state === 'synced' ? '' : 'Data planejada: a campanha só está publicada quando a plataforma confirma.',
      projectId: c.project_id,
      projectName: c.project_name,
      campaignId: c.id,
      campaignName: c.name,
    }));

  const experiments = ctx.db
    .all<{ id: string; hypothesis: string; period_from: string | null; period_to: string | null; status: string; project_id: string | null; project_name: string | null }>(
      `SELECT e.id, e.hypothesis, e.period_from, e.period_to, e.status, e.project_id, p.name AS project_name
       FROM experiments e LEFT JOIN projects p ON p.id = e.project_id WHERE e.organization_id = ? AND e.period_from IS NOT NULL`,
      [organizationId],
    )
    .filter((e) => overlaps(e.period_from!, e.period_to))
    .map<CalendarItem>((e) => ({
      id: `experiment:${e.id}`,
      source: 'experiment',
      title: `Experimento: ${e.hypothesis.slice(0, 80)}`,
      kind: 'experiment',
      startDate: e.period_from!,
      endDate: e.period_to,
      status: e.status,
      responsible: '',
      notes: '',
      projectId: e.project_id,
      projectName: e.project_name,
      campaignId: null,
      campaignName: null,
    }));

  const approvals = ctx.db
    .all<{ id: string; reason: string | null; created_at: string; campaign_id: string | null; campaign_name: string | null }>(
      `SELECT a.id, a.reason, a.created_at, x.campaign_id, c.name AS campaign_name FROM approvals a
       LEFT JOIN automation_executions x ON x.id = a.entity_id LEFT JOIN campaigns c ON c.id = x.campaign_id
       WHERE a.organization_id = ? AND a.status = 'pending'`,
      [organizationId],
    )
    .map((a) => ({ ...a, day: a.created_at.slice(0, 10) }))
    .filter((a) => overlaps(a.day, null))
    .map<CalendarItem>((a) => ({
      id: `approval:${a.id}`,
      source: 'approval',
      title: `Aprovação pendente${a.campaign_name ? `: ${a.campaign_name}` : ''}`,
      kind: 'approval',
      startDate: a.day,
      endDate: null,
      status: 'pending',
      responsible: '',
      notes: a.reason ?? '',
      projectId: null,
      projectName: null,
      campaignId: a.campaign_id,
      campaignName: a.campaign_name,
    }));

  return [...events, ...campaigns, ...experiments, ...approvals].sort((a, b) => a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title));
}

function validate(ctx: AppContext, organizationId: string, raw: unknown) {
  const d = CalendarEventInput.parse(raw);
  if (d.projectId) requireOwned(ctx, 'projects', d.projectId, organizationId, 'Projeto');
  if (d.campaignId) requireOwned(ctx, 'campaigns', d.campaignId, organizationId, 'Campanha');
  return d;
}

function requireEvent(ctx: AppContext, organizationId: string, id: string): void {
  if (!ctx.db.get('SELECT 1 AS ok FROM calendar_events WHERE id = ? AND organization_id = ?', [id, organizationId])) throw new AppError('NOT_FOUND', 'Evento não encontrado.');
}

export function createCalendarEvent(ctx: AppContext, organizationId: string, raw: unknown): string {
  requireOrg(ctx, organizationId);
  const d = validate(ctx, organizationId, raw);
  const id = ctx.newId();
  const now = ctx.now();
  ctx.db.run(
    `INSERT INTO calendar_events (id, organization_id, project_id, campaign_id, title, kind, start_date, end_date, responsible, status, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, organizationId, d.projectId, d.campaignId, d.title, d.kind, d.startDate, d.endDate, d.responsible, d.status, d.notes, now, now],
  );
  recordAudit(ctx, { organizationId, action: 'calendar.create', entityType: 'calendar_event', entityId: id, details: { title: d.title, kind: d.kind, startDate: d.startDate } });
  return id;
}

export function updateCalendarEvent(ctx: AppContext, organizationId: string, id: string, raw: unknown): void {
  requireEvent(ctx, organizationId, id);
  const d = validate(ctx, organizationId, raw);
  ctx.db.run(
    `UPDATE calendar_events SET project_id = ?, campaign_id = ?, title = ?, kind = ?, start_date = ?, end_date = ?, responsible = ?, status = ?, notes = ?, updated_at = ?
     WHERE id = ? AND organization_id = ?`,
    [d.projectId, d.campaignId, d.title, d.kind, d.startDate, d.endDate, d.responsible, d.status, d.notes, ctx.now(), id, organizationId],
  );
  recordAudit(ctx, { organizationId, action: 'calendar.update', entityType: 'calendar_event', entityId: id, details: { status: d.status } });
}

export function deleteCalendarEvent(ctx: AppContext, organizationId: string, id: string): void {
  requireEvent(ctx, organizationId, id);
  ctx.db.run('DELETE FROM calendar_events WHERE id = ? AND organization_id = ?', [id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'calendar.delete', entityType: 'calendar_event', entityId: id });
}
