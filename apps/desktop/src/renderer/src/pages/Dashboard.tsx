import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, BarChart3, CheckCircle2, Circle, Info, PlugZap } from 'lucide-react';
import { formatCurrency, formatDateTime, formatNumber, formatPercent, isoDay, type DashboardSummary, type Platform } from '@advertex/shared';
import { relativeChange } from '@advertex/advertising-core';
import { api } from '../lib/api';
import { useOrg, useOrgId } from '../lib/org';
import { PLATFORM_LABEL } from '../lib/labels';
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, LoadingState, PageHeader, Select, Stat, Tabs } from '../components/ui';

const PERIODS = [
  { value: '7', label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
] as const;

type PeriodValue = (typeof PERIODS)[number]['value'];

function change(cur: number | null, prev: number | null, invert = false): { text: string; tone: 'up' | 'down' | 'neutral' } {
  const c = relativeChange(cur, prev);
  if (c === null) return { text: 'sem base de comparação', tone: 'neutral' };
  const good = invert ? c < 0 : c > 0;
  return { text: `${c >= 0 ? '+' : ''}${(c * 100).toFixed(1)}% vs. período anterior`, tone: Math.abs(c) < 0.005 ? 'neutral' : good ? 'up' : 'down' };
}

export function DashboardPage() {
  const organizationId = useOrgId();
  const { org } = useOrg();
  const [period, setPeriod] = useState<PeriodValue>('30');
  const [platform, setPlatform] = useState<Platform | ''>('');
  const range = useMemo(() => ({ from: isoDay(-(Number(period) - 1)), to: isoDay(0) }), [period]);

  const summary = useQuery({
    queryKey: ['dashboard', organizationId, range, platform],
    queryFn: () => api('dashboard.summary', { organizationId, ...range, platform: platform || null }),
  });
  const onboarding = useQuery({ queryKey: ['onboarding', organizationId], queryFn: () => api('onboarding.getState', { organizationId }) });

  return (
    <>
      <PageHeader
        title="Visão geral"
        description={org?.isDemo ? 'Painel da organização de demonstração — números fictícios.' : 'Desempenho consolidado das contas conectadas, separado por moeda.'}
        actions={
          <>
            <Select aria-label="Plataforma" value={platform} onChange={(e) => setPlatform(e.target.value as Platform | '')} className="w-52">
              <option value="">Todas as plataformas</option>
              <option value="meta">Meta Ads</option>
              <option value="google">Google Ads</option>
            </Select>
            <Tabs value={period} onChange={setPeriod} items={PERIODS.map((p) => ({ value: p.value, label: p.label }))} />
          </>
        }
      />

      {onboarding.data && !org?.isDemo && <Checklist state={onboarding.data.checklist} />}

      {summary.isLoading && <LoadingState rows={4} />}
      {summary.error && <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />}
      {summary.data && <SummaryView s={summary.data} />}
    </>
  );
}

function Checklist({ state }: { state: { organization: boolean; project: boolean; brief: boolean; ai: boolean; meta: boolean; google: boolean } }) {
  const items = [
    { done: state.organization, label: 'Criar organização', to: '/configuracoes' },
    { done: state.project, label: 'Criar o primeiro projeto', to: '/projetos' },
    { done: state.brief, label: 'Preencher o briefing', to: '/projetos' },
    { done: state.ai, label: 'Configurar provedor de IA', to: '/configuracoes' },
    { done: state.meta, label: 'Conectar Meta Ads (opcional)', to: '/integracoes' },
    { done: state.google, label: 'Conectar Google Ads (opcional)', to: '/integracoes' },
  ];
  const done = items.filter((i) => i.done).length;
  if (done === items.length) return null;
  return (
    <Card className="mb-6">
      <CardHeader title="Configuração inicial" description={`${done} de ${items.length} etapas concluídas. Você já pode trabalhar localmente sem integrações.`} />
      <ul className="grid gap-1 p-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <li key={i.label}>
            <Link to={i.to} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-surface-3">
              {i.done ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-subtle" />}
              <span className={i.done ? 'text-muted line-through' : 'text-fg'}>{i.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SummaryView({ s }: { s: DashboardSummary }) {
  if (s.byCurrency.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="size-5" />}
        title="Ainda não há métricas para exibir"
        description="O painel mostra somente dados importados das plataformas (ou do modo demonstração). Conecte uma conta e sincronize as métricas para começar."
        action={
          <Link to="/integracoes">
            <Button icon={<PlugZap className="size-4" />}>Ir para Integrações</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>Fontes:</span>
        {s.sources.map((src) => (
          <Badge key={src} tone={src === 'demo' ? 'warning' : src === 'meta' ? 'meta' : 'google'}>
            {src === 'demo' ? 'Demonstração (fictício)' : PLATFORM_LABEL[src]}
          </Badge>
        ))}
        <span>
          · Período {s.period.from} a {s.period.to} · Última sincronização: {formatDateTime(s.lastSyncedAt)}
        </span>
      </div>

      {s.alerts.length > 0 && (
        <div className="grid gap-2">
          {s.alerts.map((a, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${a.level === 'warning' ? 'border-warning/30 bg-warning/5 text-warning' : 'border-border bg-surface text-muted'}`}>
              {a.level === 'warning' ? <AlertTriangle className="size-4 shrink-0" /> : <Info className="size-4 shrink-0" />}
              <span className="text-fg/90">{a.message}</span>
            </div>
          ))}
        </div>
      )}

      {s.byCurrency.map((c) => {
        const prev = s.previous.find((p) => p.currency === c.currency);
        const series = s.series.find((x) => x.currency === c.currency)?.points ?? [];
        return (
          <section key={c.currency} aria-label={`Métricas em ${c.currency}`} className="flex flex-col gap-4">
            {s.byCurrency.length > 1 && <h2 className="text-sm font-semibold text-muted">Moeda: {c.currency}</h2>}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat label="Investimento" value={formatCurrency(c.totals.spend, c.currency)} sub={change(c.totals.spend, prev?.totals.spend ?? null).text} tone="neutral" />
              <Stat label="Conversões" value={formatNumber(c.totals.conversions, 0)} {...pick(change(c.totals.conversions, prev?.totals.conversions ?? null))} />
              <Stat label="CPA" value={formatCurrency(c.derived.cpa, c.currency)} {...pick(change(c.derived.cpa, prev?.derived.cpa ?? null, true))} />
              <Stat label="ROAS" value={c.derived.roas === null ? '—' : `${formatNumber(c.derived.roas, 2)}x`} {...pick(change(c.derived.roas, prev?.derived.roas ?? null))} />
              <Stat label="Impressões" value={formatNumber(c.totals.impressions)} sub={`CPM ${formatCurrency(c.derived.cpm, c.currency)}`} />
              <Stat label="Cliques" value={formatNumber(c.totals.clicks)} sub={`CPC ${formatCurrency(c.derived.cpc, c.currency)}`} />
              <Stat label="CTR" value={formatPercent(c.derived.ctr)} {...pick(change(c.derived.ctr, prev?.derived.ctr ?? null))} />
              <Stat label="Receita atribuída" value={formatCurrency(c.totals.revenue, c.currency)} sub={c.totals.revenue === null ? 'não informada pela fonte' : 'conforme atribuição da plataforma'} />
            </div>

            <Card>
              <CardHeader title="Investimento e conversões por dia" description={`Valores em ${c.currency}.`} />
              <div className="h-72 px-2 py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ left: 8, right: 16, top: 8 }}>
                    <defs>
                      <linearGradient id={`spend-${c.currency}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id={`conv-${c.currency}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#262c3a" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#6b7489', fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} stroke="#262c3a" />
                    <YAxis yAxisId="spend" tick={{ fill: '#6b7489', fontSize: 11 }} stroke="#262c3a" width={70} tickFormatter={(v: number) => formatNumber(v)} />
                    <YAxis yAxisId="conv" orientation="right" tick={{ fill: '#6b7489', fontSize: 11 }} stroke="#262c3a" width={40} />
                    <Tooltip
                      contentStyle={{ background: '#181c25', border: '1px solid #343c4f', borderRadius: 10, fontSize: 12 }}
                      labelStyle={{ color: '#e8eaf0' }}
                      formatter={(v, name) => (name === 'Investimento' ? formatCurrency(Number(v), c.currency) : formatNumber(Number(v)))}
                    />
                    <Area yAxisId="spend" type="monotone" dataKey="spend" name="Investimento" stroke="#7c5cff" strokeWidth={2} fill={`url(#spend-${c.currency})`} isAnimationActive={false} />
                    <Area yAxisId="conv" type="monotone" dataKey="conversions" name="Conversões" stroke="#22d3ee" strokeWidth={2} fill={`url(#conv-${c.currency})`} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>
        );
      })}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader title="Por plataforma" />
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-subtle">
              <tr>
                <th className="px-5 py-2 font-medium">Plataforma</th>
                <th className="px-5 py-2 text-right font-medium">Investimento</th>
                <th className="px-5 py-2 text-right font-medium">CPA</th>
                <th className="px-5 py-2 text-right font-medium">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {s.byPlatform.map((p) => (
                <tr key={`${p.platform}-${p.currency}`} className="border-t border-border">
                  <td className="px-5 py-2.5">
                    <Badge tone={p.platform}>{PLATFORM_LABEL[p.platform]}</Badge>
                  </td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{formatCurrency(p.totals.spend, p.currency)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{formatCurrency(p.derived.cpa, p.currency)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{p.derived.roas === null ? '—' : `${formatNumber(p.derived.roas, 2)}x`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <CardHeader title="Campanhas com maior investimento" />
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-subtle">
              <tr>
                <th className="px-5 py-2 font-medium">Campanha</th>
                <th className="px-5 py-2 text-right font-medium">Investimento</th>
                <th className="px-5 py-2 text-right font-medium">Conv.</th>
                <th className="px-5 py-2 text-right font-medium">CPA</th>
                <th className="px-5 py-2 text-right font-medium">CTR</th>
              </tr>
            </thead>
            <tbody>
              {s.topCampaigns.map((c) => (
                <tr key={c.campaignId} className="border-t border-border">
                  <td className="max-w-[260px] truncate px-5 py-2.5" title={c.name}>
                    <span className={`mr-2 inline-block size-2 rounded-full ${c.platform === 'meta' ? 'bg-meta' : 'bg-google'}`} />
                    {c.name}
                  </td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{formatCurrency(c.totals.spend, c.currency)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{formatNumber(c.totals.conversions)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{formatCurrency(c.derived.cpa, c.currency)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{formatPercent(c.derived.ctr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

const pick = (c: { text: string; tone: 'up' | 'down' | 'neutral' }) => ({ sub: c.text, tone: c.tone });
