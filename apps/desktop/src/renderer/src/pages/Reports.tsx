import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Eye, FileSpreadsheet, FileText, Plus, ScrollText, Trash2 } from 'lucide-react';
import { ReportInput, formatCurrency, formatDateTime, formatNumber, formatPercent, isoDay, type Report } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { PLATFORM_LABEL } from '../lib/labels';
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Notice, PageHeader, Select, useToast } from '../components/ui';

export function ReportsPage() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const list = useQuery({ queryKey: ['reports', organizationId], queryFn: () => api('report.list', { organizationId }) });
  const exp = useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'csv' | 'pdf' }) => api('report.export', { organizationId, id, format }),
    onSuccess: (r) => r.savedTo && toast.success(`Relatório salvo em ${r.savedTo}`),
    onError: (e) => toast.error(e),
  });
  const del = useMutation({
    mutationFn: (id: string) => api('report.delete', { organizationId, id }),
    onSuccess: async () => {
      setDeleting(null);
      toast.success('Relatório excluído.');
      await qc.invalidateQueries({ queryKey: ['reports', organizationId] });
    },
    onError: (e) => toast.error(e),
  });

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Relatórios por projeto, plataforma e período com resumo executivo, métricas, gráficos, alertas, recomendações e limitações dos dados. Exporte em PDF ou CSV."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>
            Novo relatório
          </Button>
        }
      />
      {list.isLoading && <LoadingState />}
      {list.error && <ErrorState error={list.error} onRetry={() => void list.refetch()} />}
      {list.data?.length === 0 && (
        <EmptyState
          icon={<ScrollText className="size-5" />}
          title="Nenhum relatório"
          description="Relatórios são fotografias do período: ficam no histórico exatamente como foram gerados, mesmo após novas sincronizações."
          action={
            <Button icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>
              Novo relatório
            </Button>
          }
        />
      )}
      {list.data && list.data.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs text-subtle">
              <tr>
                <th className="px-4 py-2.5 font-medium">Relatório</th>
                <th className="px-4 py-2.5 font-medium">Período</th>
                <th className="px-4 py-2.5 font-medium">Filtros</th>
                <th className="px-4 py-2.5 font-medium">Gerado em</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {list.data.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">
                    {r.title} {r.isDemo && <Badge tone="warning">demonstração</Badge>}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.periodFrom} a {r.periodTo}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {r.projectName ?? 'Todos os projetos'} · {r.platform ? PLATFORM_LABEL[r.platform] : 'Todas as plataformas'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDateTime(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" icon={<Eye className="size-3.5" />} onClick={() => setViewing(r.id)}>
                        Ver
                      </Button>
                      <Button size="sm" variant="ghost" icon={<FileText className="size-3.5" />} loading={exp.isPending && exp.variables?.id === r.id && exp.variables.format === 'pdf'} onClick={() => exp.mutate({ id: r.id, format: 'pdf' })}>
                        PDF
                      </Button>
                      <Button size="sm" variant="ghost" icon={<FileSpreadsheet className="size-3.5" />} loading={exp.isPending && exp.variables?.id === r.id && exp.variables.format === 'csv'} onClick={() => exp.mutate({ id: r.id, format: 'csv' })}>
                        CSV
                      </Button>
                      <Button size="sm" variant="ghost" aria-label={`Excluir ${r.title}`} icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(r.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {creating && (
        <ReportForm
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false);
            setViewing(id);
          }}
        />
      )}
      {viewing && <ReportViewer id={viewing} onClose={() => setViewing(null)} />}
      <ConfirmDialog
        open={!!deleting}
        danger
        title="Excluir relatório?"
        confirmLabel="Excluir"
        message="O relatório será removido do histórico. Arquivos já exportados não são afetados."
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

type FormIn = z.input<typeof ReportInput>;
type FormOut = z.output<typeof ReportInput>;

function ReportForm({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const projects = useQuery({ queryKey: ['projects', organizationId, false], queryFn: () => api('project.list', { organizationId, includeArchived: false }) });
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(ReportInput),
    defaultValues: { title: `Relatório ${isoDay(-29)} a ${isoDay(0)}`, projectId: null, platform: null, from: isoDay(-29), to: isoDay(0) },
  });
  const { errors } = form.formState;
  const create = useMutation({
    mutationFn: (data: FormOut) => api('report.create', { organizationId, data }),
    onSuccess: async (r) => {
      toast.success('Relatório gerado.');
      await qc.invalidateQueries({ queryKey: ['reports', organizationId] });
      onCreated(r.id);
    },
    onError: (e) => toast.error(e),
  });
  const nullable = (v: string) => (v === '' ? null : v);
  return (
    <Modal
      open
      onClose={onClose}
      title="Novo relatório"
      description="O conteúdo é calculado agora e guardado como está."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="report-form" loading={create.isPending}>
            Gerar relatório
          </Button>
        </>
      }
    >
      <form id="report-form" className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit((d) => create.mutate(d))}>
        <Field label="Título" htmlFor="rp-title" required error={errors.title?.message} className="sm:col-span-2">
          <Input id="rp-title" {...form.register('title')} />
        </Field>
        <Field label="De" htmlFor="rp-from">
          <Input id="rp-from" type="date" {...form.register('from')} />
        </Field>
        <Field label="Até" htmlFor="rp-to" error={errors.to?.message}>
          <Input id="rp-to" type="date" {...form.register('to')} />
        </Field>
        <Field label="Projeto" htmlFor="rp-project">
          <Select id="rp-project" {...form.register('projectId', { setValueAs: nullable })}>
            <option value="">Todos os projetos</option>
            {projects.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Plataforma" htmlFor="rp-platform">
          <Select id="rp-platform" {...form.register('platform', { setValueAs: nullable })}>
            <option value="">Todas</option>
            <option value="meta">Meta Ads</option>
            <option value="google">Google Ads</option>
          </Select>
        </Field>
      </form>
    </Modal>
  );
}

function ReportViewer({ id, onClose }: { id: string; onClose: () => void }) {
  const organizationId = useOrgId();
  const report = useQuery({ queryKey: ['report', id], queryFn: () => api('report.get', { organizationId, id }) });
  return (
    <Modal open onClose={onClose} size="xl" title={report.data?.title ?? 'Relatório'} description={report.data ? `${report.data.periodFrom} a ${report.data.periodTo} · gerado em ${formatDateTime(report.data.createdAt)}` : undefined}>
      {report.isLoading && <LoadingState />}
      {report.error && <ErrorState error={report.error} />}
      {report.data && <ReportBody report={report.data} />}
    </Modal>
  );
}

function ReportBody({ report }: { report: Report }) {
  const c = report.content;
  return (
    <div className="flex flex-col gap-5 text-sm">
      {c.isDemo && (
        <Notice tone="warning" title="Relatório de demonstração">
          Todos os números são fictícios.
        </Notice>
      )}
      <section>
        <h3 className="mb-1 font-semibold">Resumo executivo</h3>
        <ul className="list-disc space-y-1 pl-5 text-muted">
          {c.executiveSummary.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
      {c.byCurrency.map((b) => (
        <section key={b.currency} aria-label={`Totais em ${b.currency}`}>
          <h3 className="mb-2 font-semibold">Totais em {b.currency}</h3>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              ['Investimento', formatCurrency(b.totals.spend, b.currency)],
              ['Impressões', formatNumber(b.totals.impressions)],
              ['Cliques', formatNumber(b.totals.clicks)],
              ['CTR', formatPercent(b.derived.ctr)],
              ['CPC', formatCurrency(b.derived.cpc, b.currency)],
              ['Conversões', formatNumber(b.totals.conversions, 1)],
              ['CPA', formatCurrency(b.derived.cpa, b.currency)],
              ['ROAS', b.derived.roas === null ? '—' : formatNumber(b.derived.roas, 2)],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-border bg-surface-2 p-2.5">
                <p className="text-[11px] uppercase text-subtle">{l}</p>
                <p className="font-semibold tabular-nums">{v}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
      {c.campaigns.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold">Campanhas</h3>
          <table className="w-full text-xs">
            <thead className="text-left text-subtle">
              <tr>
                <th className="py-1.5">Campanha</th>
                <th className="py-1.5 text-right">Investimento</th>
                <th className="py-1.5 text-right">Conversões</th>
                <th className="py-1.5 text-right">CPA</th>
                <th className="py-1.5 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {c.campaigns.map((r) => (
                <tr key={r.campaignId} className="border-t border-border">
                  <td className="py-1.5">
                    {r.name} <Badge tone={r.platform}>{PLATFORM_LABEL[r.platform]}</Badge>
                  </td>
                  <td className="py-1.5 text-right tabular-nums">{formatCurrency(r.totals.spend, r.currency)}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatNumber(r.totals.conversions, 1)}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatCurrency(r.derived.cpa, r.currency)}</td>
                  <td className="py-1.5 text-right tabular-nums">{r.derived.roas === null ? '—' : formatNumber(r.derived.roas, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <section>
        <h3 className="mb-1 font-semibold">Alertas</h3>
        {c.alerts.length ? (
          <ul className="list-disc pl-5 text-muted">
            {c.alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Nenhum alerta.</p>
        )}
      </section>
      <section>
        <h3 className="mb-1 font-semibold">Recomendações</h3>
        {c.recommendations.length ? (
          <ul className="list-disc pl-5 text-muted">
            {c.recommendations.map((r) => (
              <li key={r.title + (r.campaignName ?? '')}>
                <span className="text-fg">{r.title}</span>
                {r.campaignName && ` — ${r.campaignName}`}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Nenhuma recomendação aberta.</p>
        )}
      </section>
      <section>
        <h3 className="mb-1 font-semibold">Limitações dos dados</h3>
        <ul className="list-disc pl-5 text-xs text-muted">
          {c.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
