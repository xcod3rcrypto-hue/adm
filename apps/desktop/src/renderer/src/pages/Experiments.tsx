import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Ban, Calculator, Download, Flag, FlaskConical, Pencil, Play, Plus, Trash2, Trophy, X } from 'lucide-react';
import { ExperimentInput, formatDateTime, formatNumber, formatPercent, type Experiment, type ExperimentMetric } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { EXPERIMENT_METRIC_LABEL, EXPERIMENT_STATUS_LABEL } from '../lib/labels';
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Notice, PageHeader, Select, Textarea, useToast } from '../components/ui';
import { cn } from '../lib/cn';

const STATUS_TONE: Record<Experiment['status'], 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  planned: 'neutral',
  running: 'info',
  concluded: 'success',
  inconclusive: 'warning',
  cancelled: 'danger',
};

function metricText(metric: ExperimentMetric, value: number | null): string {
  if (value === null) return '—';
  // CPA na moeda das variantes (o experimento não mistura moedas).
  return metric === 'cpa' ? formatNumber(value, 2) : formatPercent(value, 2);
}

export function ExperimentsPage() {
  const organizationId = useOrgId();
  const [editing, setEditing] = useState<Experiment | 'new' | null>(null);
  const list = useQuery({ queryKey: ['experiments', organizationId], queryFn: () => api('experiment.list', { organizationId }) });

  return (
    <>
      <PageHeader
        title="Experimentos"
        description="Registre hipóteses, compare variantes com teste estatístico e documente aprendizados. Sem volume suficiente, o resultado é marcado como inconclusivo."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            Novo experimento
          </Button>
        }
      />

      {list.isLoading && <LoadingState />}
      {list.error && <ErrorState error={list.error} onRetry={() => void list.refetch()} />}
      {list.data?.length === 0 && (
        <EmptyState
          icon={<FlaskConical className="size-5" />}
          title="Nenhum experimento"
          description="Comece por uma hipótese testável, como: “Se destacarmos o frete grátis no título, o CTR aumenta, porque reduz a objeção de custo”."
          action={
            <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
              Novo experimento
            </Button>
          }
        />
      )}
      <div className="flex flex-col gap-4">
        {list.data?.map((e) => (
          <ExperimentCard key={e.id} exp={e} onEdit={() => setEditing(e)} />
        ))}
      </div>

      {editing && <ExperimentForm exp={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function ExperimentCard({ exp: e, onEdit }: { exp: Experiment; onEdit: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [concluding, setConcluding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [conclusion, setConclusion] = useState(e.conclusion);
  const refresh = () => qc.invalidateQueries({ queryKey: ['experiments', organizationId] });

  const mut = useMutation({
    mutationFn: async (action: 'start' | 'cancel' | 'reopen' | 'import' | 'evaluate' | 'delete') => {
      switch (action) {
        case 'start':
          return api('experiment.setStatus', { organizationId, id: e.id, status: 'running' });
        case 'cancel':
          return api('experiment.setStatus', { organizationId, id: e.id, status: 'cancelled' });
        case 'reopen':
          return api('experiment.setStatus', { organizationId, id: e.id, status: e.status === 'cancelled' ? 'planned' : 'running' });
        case 'import':
          return api('experiment.importMetrics', { organizationId, id: e.id });
        case 'evaluate':
          return api('experiment.evaluate', { organizationId, id: e.id });
        case 'delete':
          return api('experiment.delete', { organizationId, id: e.id });
      }
    },
    onSuccess: async (_d, action) => {
      const msg = { start: 'Experimento iniciado.', cancel: 'Experimento cancelado.', reopen: 'Experimento reaberto.', import: 'Métricas importadas das campanhas vinculadas.', evaluate: 'Resultado calculado.', delete: 'Experimento excluído.' }[action];
      toast.success(msg);
      setDeleting(false);
      await refresh();
    },
    onError: (err) => toast.error(err),
  });
  const conclude = useMutation({
    mutationFn: () => api('experiment.conclude', { organizationId, id: e.id, conclusion }),
    onSuccess: async (r) => {
      setConcluding(false);
      toast.success(r.status === 'concluded' ? 'Experimento concluído com vencedor.' : 'Experimento encerrado como inconclusivo.');
      await refresh();
    },
    onError: (err) => toast.error(err),
  });

  const open = e.status === 'planned' || e.status === 'running';
  const result = e.result;
  const hasCampaigns = e.variants.some((v) => v.campaignId);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone={STATUS_TONE[e.status]}>{EXPERIMENT_STATUS_LABEL[e.status]}</Badge>
            <Badge>Métrica: {EXPERIMENT_METRIC_LABEL[e.primaryMetric]}</Badge>
            <Badge>Variável: {e.variable}</Badge>
            {e.projectName && <Badge tone="brand">{e.projectName}</Badge>}
          </div>
          <h3 className="text-sm font-semibold selectable">{e.hypothesis}</h3>
          <p className="mt-0.5 text-xs text-subtle">
            Período: {e.periodFrom ?? '—'} a {e.periodTo ?? '—'}
            {e.decisionCriteria && <> · Critério de decisão: {e.decisionCriteria}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {open && (
            <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} onClick={onEdit}>
              Editar
            </Button>
          )}
          {e.status === 'planned' && (
            <Button size="sm" variant="secondary" icon={<Play className="size-3.5" />} loading={mut.isPending && mut.variables === 'start'} onClick={() => mut.mutate('start')}>
              Iniciar
            </Button>
          )}
          {open && hasCampaigns && (
            <Button size="sm" variant="secondary" icon={<Download className="size-3.5" />} loading={mut.isPending && mut.variables === 'import'} onClick={() => mut.mutate('import')}>
              Importar métricas
            </Button>
          )}
          <Button size="sm" variant="secondary" icon={<Calculator className="size-3.5" />} loading={mut.isPending && mut.variables === 'evaluate'} onClick={() => mut.mutate('evaluate')}>
            Calcular resultado
          </Button>
          {open && (
            <Button size="sm" icon={<Flag className="size-3.5" />} onClick={() => setConcluding(true)}>
              Encerrar
            </Button>
          )}
          {open && (
            <Button size="sm" variant="ghost" aria-label="Cancelar experimento" icon={<Ban className="size-3.5" />} onClick={() => mut.mutate('cancel')} />
          )}
          {!open && (
            <Button size="sm" variant="ghost" loading={mut.isPending && mut.variables === 'reopen'} onClick={() => mut.mutate('reopen')}>
              Reabrir
            </Button>
          )}
          <Button size="sm" variant="ghost" aria-label="Excluir experimento" icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(true)} />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs text-subtle">
            <tr>
              <th className="px-3 py-2 font-medium">Variante</th>
              <th className="px-3 py-2 text-right font-medium">Impressões</th>
              <th className="px-3 py-2 text-right font-medium">Cliques</th>
              <th className="px-3 py-2 text-right font-medium">Conversões</th>
              <th className="px-3 py-2 text-right font-medium">Gasto</th>
              <th className="px-3 py-2 text-right font-medium">{EXPERIMENT_METRIC_LABEL[e.primaryMetric]}</th>
              <th className="px-3 py-2 text-right font-medium">Vs. controle</th>
            </tr>
          </thead>
          <tbody>
            {e.variants.map((v, idx) => {
              const rv = result?.variants.find((x) => x.id === v.id);
              const cmp = result?.comparisons.find((c) => c.variantId === v.id);
              const winner = result?.winnerId === v.id;
              return (
                <tr key={v.id} className={cn('border-t border-border', winner && 'bg-success/5')}>
                  <td className="px-3 py-2">
                    <p className="flex items-center gap-1.5 font-medium">
                      {winner && <Trophy className="size-3.5 text-success" aria-label="Vencedora" />}
                      {v.label}
                      {idx === 0 && <span className="text-[11px] font-normal text-subtle">(controle)</span>}
                    </p>
                    <p className="text-[11px] text-subtle">{[v.creativeTitle && `Criativo: ${v.creativeTitle}`, v.campaignName && `Campanha: ${v.campaignName}`].filter(Boolean).join(' · ') || 'Métricas manuais'}</p>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatNumber(v.impressions)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatNumber(v.clicks)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatNumber(v.conversions, 1)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatNumber(v.spend, 2)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {rv ? metricText(e.primaryMetric, rv.value) : '—'}
                    {rv && !rv.sampleOk && <span className="block text-[11px] text-warning">volume insuficiente</span>}
                  </td>
                  <td className="px-3 py-2 text-right text-xs tabular-nums">
                    {cmp ? (
                      <>
                        <span className={cn(cmp.significant ? (cmp.better ? 'text-success' : 'text-danger') : 'text-muted')}>
                          {cmp.lift === null ? '—' : `${cmp.lift >= 0 ? '+' : ''}${(cmp.lift * 100).toFixed(1)}%`}
                        </span>
                        <span className="block text-subtle">{cmp.pValue === null ? 'p = —' : cmp.pValue < 0.001 ? 'p < 0,001' : `p = ${cmp.pValue.toFixed(3).replace('.', ',')}`}</span>
                      </>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {result && (
        <div className="mt-3">
          <Notice tone={result.outcome === 'winner' ? 'success' : 'warning'} title={result.outcome === 'winner' ? 'Resultado significativo' : 'Resultado inconclusivo'}>
            {result.reason} <span className="text-subtle">Volume mínimo: {result.minSample}. Calculado em {formatDateTime(result.evaluatedAt)}.</span>
          </Notice>
        </div>
      )}
      {e.conclusion && !open && (
        <div className="mt-3 rounded-lg bg-surface-2 p-3 text-sm">
          <p className="text-xs font-medium text-fg">Aprendizado registrado</p>
          <p className="mt-0.5 text-muted selectable">{e.conclusion}</p>
        </div>
      )}

      <Modal
        open={concluding}
        onClose={() => setConcluding(false)}
        title="Encerrar experimento"
        description="O status final segue a estatística: concluído apenas com vencedor significativo; caso contrário, inconclusivo."
        footer={
          <>
            <Button variant="ghost" icon={<X className="size-4" />} onClick={() => setConcluding(false)}>
              Cancelar
            </Button>
            <Button loading={conclude.isPending} icon={<Flag className="size-4" />} onClick={() => conclude.mutate()}>
              Encerrar e registrar
            </Button>
          </>
        }
      >
        <Field label="Aprendizado e próximos passos" htmlFor={`concl-${e.id}`} hint="Fica no histórico do experimento para orientar os próximos testes.">
          <Textarea id={`concl-${e.id}`} value={conclusion} onChange={(ev) => setConclusion(ev.target.value)} maxLength={4000} />
        </Field>
      </Modal>
      <ConfirmDialog
        open={deleting}
        danger
        title="Excluir experimento?"
        message="O experimento e suas variantes serão excluídos permanentemente."
        confirmLabel="Excluir"
        loading={mut.isPending && mut.variables === 'delete'}
        onConfirm={() => mut.mutate('delete')}
        onClose={() => setDeleting(false)}
      />
    </Card>
  );
}

type FormIn = z.input<typeof ExperimentInput>;
type FormOut = z.output<typeof ExperimentInput>;

const num = (v: string) => (v === '' ? 0 : Number(v));
const nullable = (v: string) => (v === '' ? null : v);

function ExperimentForm({ exp, onClose }: { exp: Experiment | null; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const projects = useQuery({ queryKey: ['projects', organizationId, false], queryFn: () => api('project.list', { organizationId, includeArchived: false }) });
  const campaigns = useQuery({ queryKey: ['campaigns', organizationId, 'all'], queryFn: () => api('campaign.list', { organizationId, platform: null }) });
  const creatives = useQuery({ queryKey: ['creatives', organizationId, 'all'], queryFn: () => api('creative.list', { organizationId }) });

  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(ExperimentInput),
    defaultValues: exp
      ? {
          projectId: exp.projectId,
          hypothesis: exp.hypothesis,
          variable: exp.variable,
          primaryMetric: exp.primaryMetric,
          periodFrom: exp.periodFrom,
          periodTo: exp.periodTo,
          decisionCriteria: exp.decisionCriteria,
          variants: exp.variants.map((v) => ({ id: v.id, label: v.label, creativeId: v.creativeId, campaignId: v.campaignId, impressions: v.impressions, clicks: v.clicks, conversions: v.conversions, spend: v.spend })),
        }
      : {
          projectId: null,
          hypothesis: '',
          variable: '',
          primaryMetric: 'ctr',
          periodFrom: null,
          periodTo: null,
          decisionCriteria: 'Adotar a variante vencedora se a diferença for significativa a 95%.',
          variants: [
            { label: 'Controle', creativeId: null, campaignId: null, impressions: 0, clicks: 0, conversions: 0, spend: 0 },
            { label: 'Variante B', creativeId: null, campaignId: null, impressions: 0, clicks: 0, conversions: 0, spend: 0 },
          ],
        },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'variants' });
  const { errors } = form.formState;

  const save = useMutation({
    mutationFn: (data: FormOut) => (exp ? api('experiment.update', { organizationId, id: exp.id, data }) : api('experiment.create', { organizationId, data })),
    onSuccess: async () => {
      toast.success('Experimento salvo.');
      await qc.invalidateQueries({ queryKey: ['experiments', organizationId] });
      onClose();
    },
    onError: (e) => toast.error(e),
  });

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={exp ? 'Editar experimento' : 'Novo experimento'}
      description="A primeira variante é o controle. Vincule campanhas para importar métricas do período, ou informe os números manualmente."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="exp-form" loading={save.isPending}>
            Salvar experimento
          </Button>
        </>
      }
    >
      <form id="exp-form" className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((d) => save.mutate(d))}>
        <Field label="Hipótese" htmlFor="ex-hyp" required error={errors.hypothesis?.message} className="md:col-span-2" hint="Formato sugerido: Se…, então…, porque…">
          <Textarea id="ex-hyp" aria-invalid={!!errors.hypothesis} {...form.register('hypothesis')} />
        </Field>
        <Field label="Variável testada" htmlFor="ex-var" required error={errors.variable?.message}>
          <Input id="ex-var" placeholder="Ex.: título, imagem, público, oferta" {...form.register('variable')} />
        </Field>
        <Field label="Métrica primária" htmlFor="ex-metric">
          <Select id="ex-metric" {...form.register('primaryMetric')}>
            {(Object.keys(EXPERIMENT_METRIC_LABEL) as ExperimentMetric[]).map((m) => (
              <option key={m} value={m}>
                {EXPERIMENT_METRIC_LABEL[m]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Início" htmlFor="ex-from">
          <Input id="ex-from" type="date" {...form.register('periodFrom', { setValueAs: nullable })} />
        </Field>
        <Field label="Término" htmlFor="ex-to" error={errors.periodTo?.message}>
          <Input id="ex-to" type="date" {...form.register('periodTo', { setValueAs: nullable })} />
        </Field>
        <Field label="Projeto" htmlFor="ex-project">
          <Select id="ex-project" {...form.register('projectId', { setValueAs: nullable })}>
            <option value="">Sem projeto</option>
            {projects.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Critério de decisão" htmlFor="ex-crit">
          <Input id="ex-crit" {...form.register('decisionCriteria')} />
        </Field>

        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted">Variantes</p>
            <Button
              size="sm"
              variant="outline"
              icon={<Plus className="size-3.5" />}
              disabled={fields.length >= 6}
              onClick={() => append({ label: `Variante ${String.fromCharCode(65 + fields.length)}`, creativeId: null, campaignId: null, impressions: 0, clicks: 0, conversions: 0, spend: 0 })}
            >
              Adicionar variante
            </Button>
          </div>
          {errors.variants?.root?.message && <p className="mb-2 text-xs text-danger">{errors.variants.root.message}</p>}
          {errors.variants?.message && <p className="mb-2 text-xs text-danger">{errors.variants.message}</p>}
          <div className="flex flex-col gap-3">
            {fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-2 p-3 md:grid-cols-6">
                <Field label={i === 0 ? 'Nome (controle)' : 'Nome'} htmlFor={`v-${i}-label`} error={errors.variants?.[i]?.label?.message} className="col-span-2">
                  <Input id={`v-${i}-label`} {...form.register(`variants.${i}.label`)} />
                </Field>
                <Field label="Criativo" htmlFor={`v-${i}-cr`} className="col-span-2">
                  <Select id={`v-${i}-cr`} {...form.register(`variants.${i}.creativeId`, { setValueAs: nullable })}>
                    <option value="">—</option>
                    {creatives.data?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Campanha" htmlFor={`v-${i}-cp`} className="col-span-2">
                  <Select id={`v-${i}-cp`} {...form.register(`variants.${i}.campaignId`, { setValueAs: nullable })}>
                    <option value="">—</option>
                    {campaigns.data?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Impressões" htmlFor={`v-${i}-imp`}>
                  <Input id={`v-${i}-imp`} type="number" min="0" step="1" {...form.register(`variants.${i}.impressions`, { setValueAs: num })} />
                </Field>
                <Field label="Cliques" htmlFor={`v-${i}-clk`}>
                  <Input id={`v-${i}-clk`} type="number" min="0" step="1" {...form.register(`variants.${i}.clicks`, { setValueAs: num })} />
                </Field>
                <Field label="Conversões" htmlFor={`v-${i}-conv`}>
                  <Input id={`v-${i}-conv`} type="number" min="0" step="any" {...form.register(`variants.${i}.conversions`, { setValueAs: num })} />
                </Field>
                <Field label="Gasto" htmlFor={`v-${i}-sp`}>
                  <Input id={`v-${i}-sp`} type="number" min="0" step="0.01" {...form.register(`variants.${i}.spend`, { setValueAs: num })} />
                </Field>
                <div className="col-span-2 flex items-end justify-end">
                  {fields.length > 2 && (
                    <Button size="sm" variant="ghost" icon={<Trash2 className="size-3.5" />} onClick={() => remove(i)}>
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
