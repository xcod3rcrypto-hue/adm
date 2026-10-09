import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertOctagon, AlertTriangle, Brain, Check, CheckCheck, Info, Lightbulb, Play, RotateCcw, TrendingUp, X } from 'lucide-react';
import { formatDateTime, isoDay, type DiagnosticSeverity, type Insight, type Platform, type Recommendation, type RecommendationStatus } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { ACTION_LABEL, DIAGNOSTIC_LABEL, PLATFORM_LABEL, RECOMMENDATION_STATUS_LABEL, SEVERITY_LABEL } from '../lib/labels';
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, LoadingState, Notice, PageHeader, Select, Tabs, useToast } from '../components/ui';
import { cn } from '../lib/cn';

const PERIODS = [
  { value: '14', label: '14 dias' },
  { value: '30', label: '30 dias' },
  { value: '60', label: '60 dias' },
] as const;
type PeriodValue = (typeof PERIODS)[number]['value'];

const SEVERITY_TONE: Record<DiagnosticSeverity, 'danger' | 'warning' | 'success' | 'info'> = {
  critical: 'danger',
  warning: 'warning',
  opportunity: 'success',
  info: 'info',
};

const SEVERITY_ICON: Record<DiagnosticSeverity, typeof AlertTriangle> = {
  critical: AlertOctagon,
  warning: AlertTriangle,
  opportunity: TrendingUp,
  info: Info,
};

export function IntelligencePage() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [period, setPeriod] = useState<PeriodValue>('30');
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [recFilter, setRecFilter] = useState<RecommendationStatus | 'all'>('open');
  const range = useMemo(() => ({ from: isoDay(-(Number(period) - 1)), to: isoDay(0) }), [period]);

  const report = useQuery({ queryKey: ['intelligence', organizationId], queryFn: () => api('intelligence.get', { organizationId }) });
  const run = useMutation({
    mutationFn: () => api('intelligence.run', { organizationId, ...range, platform: platform || null }),
    onSuccess: (data) => {
      qc.setQueryData(['intelligence', organizationId], data);
      toast.success(data.insights.length === 0 ? 'Análise concluída: nenhum problema relevante encontrado.' : `Análise concluída: ${data.insights.length} achado(s).`);
    },
    onError: (e) => toast.error(e),
  });

  const recs = report.data?.recommendations.filter((r) => recFilter === 'all' || r.status === recFilter) ?? [];

  return (
    <>
      <PageHeader
        title="Inteligência"
        description="Diagnósticos determinísticos sobre as métricas importadas: cada achado mostra evidências, período, confiança, impacto, riscos e limitações."
        actions={
          <>
            <Select aria-label="Plataforma da análise" value={platform} onChange={(e) => setPlatform(e.target.value as Platform | '')} className="w-48">
              <option value="">Todas as plataformas</option>
              <option value="meta">Meta Ads</option>
              <option value="google">Google Ads</option>
            </Select>
            <Tabs value={period} onChange={setPeriod} items={PERIODS.map((p) => ({ value: p.value, label: p.label }))} />
            <Button icon={<Play className="size-4" />} loading={run.isPending} onClick={() => run.mutate()}>
              Executar análise
            </Button>
          </>
        }
      />

      {report.isLoading && <LoadingState rows={4} />}
      {report.error && <ErrorState error={report.error} onRetry={() => void report.refetch()} />}

      {report.data && (
        <div className="flex flex-col gap-6">
          {report.data.isDemo && (
            <Notice tone="warning" title="Dados de demonstração">
              Os achados abaixo foram calculados sobre métricas fictícias e não representam resultados reais.
            </Notice>
          )}

          {report.data.generatedAt ? (
            <p className="text-xs text-subtle">
              Última análise: {formatDateTime(report.data.generatedAt)} · período {report.data.period?.from} a {report.data.period?.to} (comparado ao período anterior de mesma
              duração) · fontes: {report.data.sources.length > 0 ? report.data.sources.join(', ') : 'nenhuma métrica no período'}
            </p>
          ) : (
            <EmptyState
              icon={<Brain className="size-5" />}
              title="Nenhuma análise executada"
              description="Importe métricas em Integrações (ou use o modo de demonstração) e execute a análise para receber diagnósticos com evidências."
              action={
                <Button icon={<Play className="size-4" />} loading={run.isPending} onClick={() => run.mutate()}>
                  Executar análise
                </Button>
              }
            />
          )}

          {report.data.generatedAt && (
            <section aria-labelledby="diag-title">
              <h2 id="diag-title" className="mb-3 text-sm font-semibold">
                Diagnósticos ({report.data.insights.length})
              </h2>
              {report.data.insights.length === 0 ? (
                <Notice tone="success" title="Nada relevante detectado">
                  Nenhum diagnóstico ultrapassou os limiares no período analisado. Isso não garante ausência de problemas: veja as limitações abaixo.
                </Notice>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {report.data.insights.map((i) => (
                    <InsightCard key={i.id} insight={i} />
                  ))}
                </div>
              )}
            </section>
          )}

          {report.data.recommendations.length > 0 && (
            <section aria-labelledby="rec-title">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 id="rec-title" className="text-sm font-semibold">
                  Recomendações
                </h2>
                <Tabs
                  value={recFilter}
                  onChange={setRecFilter}
                  items={[
                    { value: 'open', label: 'Abertas' },
                    { value: 'accepted', label: 'Aceitas' },
                    { value: 'done', label: 'Concluídas' },
                    { value: 'dismissed', label: 'Descartadas' },
                    { value: 'all', label: 'Todas' },
                  ]}
                />
              </div>
              {recs.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border-strong p-6 text-center text-sm text-muted">Nenhuma recomendação neste filtro.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recs.map((r) => (
                    <RecommendationCard key={r.id} rec={r} />
                  ))}
                </div>
              )}
            </section>
          )}

          <Card>
            <CardHeader title="Limitações da análise" description="Leia antes de agir sobre qualquer recomendação." />
            <ul className="list-disc space-y-1.5 px-9 py-4 text-sm text-muted">
              {report.data.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}

function Confidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2" title="Confiança cresce com o volume de dados observado">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-3" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Confiança">
        <div className={cn('h-full rounded-full', pct >= 70 ? 'bg-success' : pct >= 45 ? 'bg-warning' : 'bg-danger')} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted">{pct}% de confiança</span>
    </div>
  );
}

function InsightCard({ insight: i }: { insight: Insight }) {
  const Icon = SEVERITY_ICON[i.severity];
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 size-5 shrink-0', { critical: 'text-danger', warning: 'text-warning', opportunity: 'text-success', info: 'text-info' }[i.severity])} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Badge tone={SEVERITY_TONE[i.severity]}>{SEVERITY_LABEL[i.severity]}</Badge>
            <Badge>{DIAGNOSTIC_LABEL[i.kind]}</Badge>
            {i.platform && <Badge tone={i.platform}>{PLATFORM_LABEL[i.platform]}</Badge>}
          </div>
          <h3 className="text-sm font-semibold">{i.title}</h3>
          <p className="mt-1 text-sm text-muted">{i.summary}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-surface-2 p-3 text-xs">
        {i.evidence.map((e) => (
          <div key={e.label}>
            <dt className="text-subtle">{e.label}</dt>
            <dd className="font-medium tabular-nums text-fg selectable">{e.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted">
        <span className="font-medium text-fg">Impacto potencial:</span> {i.impact}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Confidence value={i.confidence} />
        <span className="text-[11px] text-subtle">
          Período: {i.periodFrom} a {i.periodTo}
        </span>
      </div>
    </Card>
  );
}

function RecommendationCard({ rec: r }: { rec: Recommendation }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const setStatus = useMutation({
    mutationFn: (status: RecommendationStatus) => api('recommendation.setStatus', { organizationId, id: r.id, status }),
    onSuccess: async (_d, status) => {
      toast.success(`Recomendação marcada como "${RECOMMENDATION_STATUS_LABEL[status].toLowerCase()}".`);
      await qc.invalidateQueries({ queryKey: ['intelligence', organizationId] });
    },
    onError: (e) => toast.error(e),
  });
  const stale = r.insightId === null;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Lightbulb className="size-4 text-accent" aria-hidden />
            <Badge tone={r.status === 'open' ? 'brand' : r.status === 'accepted' ? 'info' : r.status === 'done' ? 'success' : 'neutral'}>{RECOMMENDATION_STATUS_LABEL[r.status]}</Badge>
            {r.action && <Badge>{ACTION_LABEL[r.action.type]}{r.action.type === 'adjust_budget' ? ` ${r.action.changePercent > 0 ? '+' : ''}${r.action.changePercent}%` : ''}</Badge>}
            {stale && <Badge tone="neutral">não detectado na última análise</Badge>}
          </div>
          <h3 className="text-sm font-semibold">{r.title}</h3>
          {r.campaignName && <p className="text-xs text-subtle">Campanha: {r.campaignName}</p>}
        </div>
        <div className="flex shrink-0 gap-1.5">
          {r.status === 'open' && (
            <>
              <Button size="sm" variant="secondary" icon={<Check className="size-3.5" />} loading={setStatus.isPending} onClick={() => setStatus.mutate('accepted')}>
                Aceitar
              </Button>
              <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} disabled={setStatus.isPending} onClick={() => setStatus.mutate('dismissed')}>
                Descartar
              </Button>
            </>
          )}
          {r.status === 'accepted' && (
            <Button size="sm" variant="secondary" icon={<CheckCheck className="size-3.5" />} loading={setStatus.isPending} onClick={() => setStatus.mutate('done')}>
              Marcar como concluída
            </Button>
          )}
          {(r.status === 'dismissed' || r.status === 'done') && (
            <Button size="sm" variant="ghost" icon={<RotateCcw className="size-3.5" />} loading={setStatus.isPending} onClick={() => setStatus.mutate('open')}>
              Reabrir
            </Button>
          )}
        </div>
      </div>
      <div className="mt-3 grid gap-3 text-xs md:grid-cols-3">
        <div>
          <p className="font-medium text-fg">Por quê</p>
          <p className="mt-0.5 text-muted">{r.rationale}</p>
        </div>
        <div>
          <p className="font-medium text-fg">Riscos</p>
          <p className="mt-0.5 text-muted">{r.risks ?? '—'}</p>
        </div>
        <div>
          <p className="font-medium text-fg">Limitações</p>
          <p className="mt-0.5 text-muted">{r.limitations ?? '—'}</p>
        </div>
      </div>
      {r.confidence !== null && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Confidence value={r.confidence} />
          {r.impact && <span className="text-xs text-muted">{r.impact}</span>}
        </div>
      )}
    </Card>
  );
}
