import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { CalendarEventInput, isoDay, type CalendarItem, type CalendarKind, type CalendarStatus } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { Badge, Button, Card, ConfirmDialog, ErrorState, Field, Input, LoadingState, Modal, Notice, PageHeader, Select, Textarea, useToast } from '../components/ui';
import { cn } from '../lib/cn';

const KIND_LABEL: Record<CalendarKind, string> = {
  task: 'Tarefa',
  launch: 'Lançamento',
  approval: 'Aprovação',
  review: 'Revisão',
  deadline: 'Prazo',
  other: 'Outro',
};
const STATUS_LABEL: Record<CalendarStatus, string> = { todo: 'A fazer', doing: 'Em andamento', done: 'Concluído', cancelled: 'Cancelado' };
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function tone(i: CalendarItem): string {
  if (i.source === 'campaign') return 'bg-meta/15 text-meta border-meta/30';
  if (i.source === 'experiment') return 'bg-accent/15 text-accent border-accent/30';
  if (i.source === 'approval' || i.kind === 'approval') return 'bg-warning/15 text-warning border-warning/30';
  if (i.status === 'done') return 'bg-success/10 text-success border-success/30 line-through';
  if (i.kind === 'deadline') return 'bg-danger/10 text-danger border-danger/30';
  return 'bg-brand/15 text-[#b9a8ff] border-brand/30';
}

export function CalendarPage() {
  const organizationId = useOrgId();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [editing, setEditing] = useState<CalendarItem | { new: string } | null>(null);
  const grid = useMemo(() => {
    const start = new Date(month);
    start.setDate(1 - start.getDay());
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [month]);
  const from = ymd(grid[0]!);
  const to = ymd(grid[41]!);
  const items = useQuery({ queryKey: ['calendar', organizationId, from, to], queryFn: () => api('calendar.list', { organizationId, from, to }) });
  const today = isoDay(0);
  const rawLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(month);
  const monthLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
  const upcoming = (items.data ?? []).filter((i) => (i.endDate ?? i.startDate) >= today && i.status !== 'done' && i.status !== 'cancelled').slice(0, 12);

  return (
    <>
      <PageHeader
        title="Calendário"
        description="Campanhas, lançamentos, tarefas, responsáveis, prazos e aprovações. Datas de campanha são planejamento: publicação só conta com confirmação da plataforma."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setEditing({ new: today })}>
            Novo evento
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <Button size="sm" variant="ghost" aria-label="Mês anterior" icon={<ChevronLeft className="size-4" />} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} />
            <h2 className="font-display text-base font-semibold">{monthLabel}</h2>
            <Button size="sm" variant="ghost" aria-label="Próximo mês" icon={<ChevronRight className="size-4" />} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} />
          </div>
          {items.error && <ErrorState error={items.error} />}
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border" role="grid" aria-label={`Calendário de ${monthLabel}`}>
            {WEEKDAYS.map((w) => (
              <div key={w} className="bg-surface-2 py-1.5 text-center text-[11px] font-medium uppercase text-subtle" role="columnheader">
                {w}
              </div>
            ))}
            {grid.map((d) => {
              const day = ymd(d);
              const inMonth = d.getMonth() === month.getMonth();
              const dayItems = (items.data ?? []).filter((i) => i.startDate <= day && (i.endDate ?? i.startDate) >= day);
              return (
                <div
                  key={day}
                  role="gridcell"
                  aria-label={day}
                  className={cn('min-h-24 bg-surface p-1.5 text-left', !inMonth && 'bg-surface/40 text-subtle')}
                  onDoubleClick={() => setEditing({ new: day })}
                >
                  <span className={cn('mb-1 inline-grid size-6 place-items-center rounded-full text-xs', day === today && 'bg-brand font-semibold text-white')}>{d.getDate()}</span>
                  <div className="flex flex-col gap-0.5">
                    {dayItems.slice(0, 3).map((i) => (
                      <button
                        key={i.id}
                        type="button"
                        title={`${i.title}${i.responsible ? ` — ${i.responsible}` : ''}`}
                        className={cn('truncate rounded border px-1 py-0.5 text-left text-[11px]', tone(i), i.source !== 'event' && 'cursor-default')}
                        onClick={() => i.source === 'event' && setEditing(i)}
                      >
                        {i.title}
                      </button>
                    ))}
                    {dayItems.length > 3 && <span className="text-[10px] text-subtle">+{dayItems.length - 3}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-subtle">Clique duas vezes em um dia para criar um evento. Itens azuis são campanhas, cianos são experimentos e amarelos, aprovações.</p>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="size-4" /> Próximos
          </h2>
          {items.isLoading && <LoadingState rows={3} />}
          {items.data && upcoming.length === 0 && <p className="text-sm text-muted">Nada pendente neste período.</p>}
          <ul className="flex flex-col gap-2">
            {upcoming.map((i) => (
              <li key={i.id} className="rounded-lg border border-border bg-surface-2 p-2.5 text-xs">
                <p className="font-medium text-fg">{i.title}</p>
                <p className="text-subtle">
                  {i.startDate}
                  {i.endDate && i.endDate !== i.startDate ? ` a ${i.endDate}` : ''}
                  {i.responsible && ` · ${i.responsible}`}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge>{i.source === 'event' ? KIND_LABEL[i.kind as CalendarKind] : i.source === 'campaign' ? 'Campanha' : i.source === 'experiment' ? 'Experimento' : 'Aprovação'}</Badge>
                  {i.source === 'event' && <Badge tone="info">{STATUS_LABEL[i.status as CalendarStatus]}</Badge>}
                  {i.source === 'campaign' && <Badge tone="meta">{i.status}</Badge>}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {editing && <EventForm item={'new' in editing ? null : editing} defaultDate={'new' in editing ? editing.new : today} onClose={() => setEditing(null)} />}
    </>
  );
}

type FormIn = z.input<typeof CalendarEventInput>;
type FormOut = z.output<typeof CalendarEventInput>;

function EventForm({ item, defaultDate, onClose }: { item: CalendarItem | null; defaultDate: string; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);
  const projects = useQuery({ queryKey: ['projects', organizationId, false], queryFn: () => api('project.list', { organizationId, includeArchived: false }) });
  const campaigns = useQuery({ queryKey: ['campaigns', organizationId, 'all'], queryFn: () => api('campaign.list', { organizationId, platform: null }) });
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(CalendarEventInput),
    defaultValues: item
      ? {
          title: item.title,
          kind: item.kind as CalendarKind,
          startDate: item.startDate,
          endDate: item.endDate,
          responsible: item.responsible,
          status: item.status as CalendarStatus,
          notes: item.notes,
          projectId: item.projectId,
          campaignId: item.campaignId,
        }
      : { title: '', kind: 'task', startDate: defaultDate, endDate: null, responsible: '', status: 'todo', notes: '', projectId: null, campaignId: null },
  });
  const { errors } = form.formState;
  const refresh = () => qc.invalidateQueries({ queryKey: ['calendar', organizationId] });
  const save = useMutation({
    mutationFn: async (data: FormOut) => {
      if (item) await api('calendar.update', { organizationId, id: item.id, data });
      else await api('calendar.create', { organizationId, data });
    },
    onSuccess: async () => {
      toast.success('Evento salvo.');
      await refresh();
      onClose();
    },
    onError: (e) => toast.error(e),
  });
  const del = useMutation({
    mutationFn: () => api('calendar.delete', { organizationId, id: item!.id }),
    onSuccess: async () => {
      toast.success('Evento excluído.');
      await refresh();
      onClose();
    },
    onError: (e) => toast.error(e),
  });
  const nullable = (v: string) => (v === '' ? null : v);

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={item ? 'Editar evento' : 'Novo evento'}
      footer={
        <>
          {item && (
            <Button variant="danger" className="mr-auto" icon={<Trash2 className="size-4" />} onClick={() => setDeleting(true)}>
              Excluir
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="event-form" loading={save.isPending}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="event-form" className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((d) => save.mutate(d))}>
        <Field label="Título" htmlFor="ev-title" required error={errors.title?.message} className="md:col-span-2">
          <Input id="ev-title" {...form.register('title')} />
        </Field>
        <Field label="Tipo" htmlFor="ev-kind">
          <Select id="ev-kind" {...form.register('kind')}>
            {(Object.keys(KIND_LABEL) as CalendarKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="ev-status">
          <Select id="ev-status" {...form.register('status')}>
            {(Object.keys(STATUS_LABEL) as CalendarStatus[]).map((k) => (
              <option key={k} value={k}>
                {STATUS_LABEL[k]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Início" htmlFor="ev-start" error={errors.startDate?.message}>
          <Input id="ev-start" type="date" {...form.register('startDate')} />
        </Field>
        <Field label="Término (opcional)" htmlFor="ev-end" error={errors.endDate?.message}>
          <Input id="ev-end" type="date" {...form.register('endDate', { setValueAs: nullable })} />
        </Field>
        <Field label="Responsável" htmlFor="ev-resp">
          <Input id="ev-resp" {...form.register('responsible')} />
        </Field>
        <Field label="Projeto" htmlFor="ev-project">
          <Select id="ev-project" {...form.register('projectId', { setValueAs: nullable })}>
            <option value="">—</option>
            {projects.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Campanha relacionada" htmlFor="ev-campaign" className="md:col-span-2">
          <Select id="ev-campaign" {...form.register('campaignId', { setValueAs: nullable })}>
            <option value="">—</option>
            {campaigns.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notas" htmlFor="ev-notes" className="md:col-span-2">
          <Textarea id="ev-notes" {...form.register('notes')} />
        </Field>
        {form.watch('kind') === 'launch' && (
          <div className="md:col-span-2">
            <Notice tone="info">Um lançamento agendado aqui não publica nada. Publique a campanha em Campanhas; ela só conta como publicada após a confirmação da plataforma.</Notice>
          </div>
        )}
      </form>
      <ConfirmDialog open={deleting} danger title="Excluir evento?" message="O evento será removido do calendário." confirmLabel="Excluir" loading={del.isPending} onConfirm={() => del.mutate()} onClose={() => setDeleting(false)} />
    </Modal>
  );
}
