import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCheck, CircleDollarSign, KeyRound, PauseCircle, Play, Plane, TrendingDown, TrendingUp, X } from 'lucide-react';
import { formatCurrency, formatDateTime, formatNumber, type AutopilotAction, type AutopilotActionKind, type AutopilotSettings, type SearchTermRow } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrg, useOrgId } from '../lib/org';
import { PLATFORM_LABEL } from '../lib/labels';
import { Badge, Button, Card, CardHeader, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Notice, PageHeader, Stat, Tabs, useToast } from '../components/ui';

const KIND: Record<AutopilotActionKind, { label: string; icon: typeof Ban; tone: 'danger' | 'success' | 'warning' | 'info' }> = {
  add_negative: { label: 'Negativar termo', icon: Ban, tone: 'danger' },
  add_keyword: { label: 'Nova palavra-chave', icon: KeyRound, tone: 'success' },
  pause_ad: { label: 'Pausar anúncio', icon: PauseCircle, tone: 'warning' },
  increase_budget: { label: 'Escalar orçamento', icon: TrendingUp, tone: 'success' },
  decrease_budget: { label: 'Reduzir orçamento', icon: TrendingDown, tone: 'warning' },
};

export function AutopilotPage() {
  const organizationId = useOrgId();
  const { org } = useOrg();
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState<'queue' | 'terms' | 'history'>('queue');
  const [selected, setSelected] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const overview = useQuery({ queryKey: ['autopilot', organizationId], queryFn: () => api('autopilot.overview', { organizationId }) });
  const o = overview.data;

  useEffect(() => {
    if (o) setSelected((s) => s.filter((id) => o.proposed.some((a) => a.id === id)));
  }, [o]);

  const refresh = () => qc.invalidateQueries({ queryKey: ['autopilot'] });
  const run = useMutation({
    mutationFn: () => api('autopilot.run', { organizationId, sync: !org?.isDemo }),
    onSuccess: async (r) => {
      toast.success(`Análise concluída: ${r.proposed} ação(ões) na fila.`);
      r.notes.slice(0, 2).forEach((n) => toast.info(n));
      await refresh();
    },
    onError: (e) => toast.error(e),
  });
  const apply = useMutation({
    mutationFn: (ids: string[]) => api('autopilot.apply', { organizationId, ids, confirm: true }),
    onSuccess: async (r) => {
      setConfirming(false);
      setSelected([]);
      if (r.applied) toast.success(`${r.applied} ação(ões) aplicada(s).`);
      r.failed.forEach((f) => toast.error(f.error));
      await refresh();
    },
    onError: (e) => toast.error(e),
  });
  const dismiss = useMutation({
    mutationFn: (id: string) => api('autopilot.dismiss', { organizationId, id }),
    onSuccess: (data) => qc.setQueryData(['autopilot', organizationId], data),
    onError: (e) => toast.error(e),
  });

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <PageHeader
        title="Piloto automático"
        description="Analisa termos de busca, anúncios e campanhas e propõe ações concretas — negativar desperdício, proteger buscas que vendem, pausar anúncios perdedores e ajustar orçamento. Você aprova; nada é enviado sem sua confirmação."
        actions={
          <Button icon={<Play className="size-4" />} loading={run.isPending} onClick={() => run.mutate()}>
            Analisar agora
          </Button>
        }
      />
      {overview.isLoading && <LoadingState rows={4} />}
      {overview.error && <ErrorState error={overview.error} onRetry={() => void overview.refetch()} />}
      {o && (
        <div className="flex flex-col gap-6">
          {org?.isDemo && (
            <Notice tone="warning" title="Demonstração">
              Os dados são fictícios e as ações aplicadas aqui são apenas simuladas — nada é enviado às plataformas.
            </Notice>
          )}
          {o.killSwitch && (
            <Notice tone="danger" title="Botão de emergência ativo">
              As automações estão pausadas (em Automações). Nenhuma ação do piloto será aplicada até desativar.
            </Notice>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Ações na fila" value={formatNumber(o.proposed.length)} sub={o.lastRunAt ? `Última análise ${formatDateTime(o.lastRunAt)}` : 'Ainda não analisado'} />
            <Stat label="Economia estimada" value={formatCurrency(o.savingsEstimate, o.currency)} sub="por mês, se aplicar as ações de corte" tone="up" />
            <Stat label="Termos de busca" value={formatNumber(o.searchTerms.total)} sub={o.searchTerms.periodFrom ? `${o.searchTerms.periodFrom} a ${o.searchTerms.periodTo}` : 'Google Ads · últimos 30 dias'} />
            <Stat label="Aplicadas" value={formatNumber(o.history.filter((h) => h.status === 'applied').length)} sub={`${o.history.filter((h) => h.auto).length} automaticamente`} />
          </div>

          <SettingsCard settings={o.settings} currency={o.currency} />

          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: 'queue', label: `Fila de aprovação (${o.proposed.length})` },
              { value: 'terms', label: 'Termos de busca' },
              { value: 'history', label: 'Histórico' },
            ]}
          />

          {tab === 'queue' && (
            <Card>
              <CardHeader
                title="Ações propostas"
                description="Ordenadas pelo dinheiro em jogo. Marque as que quer aplicar."
                actions={
                  o.proposed.length > 0 && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setSelected(selected.length === o.proposed.length ? [] : o.proposed.map((a) => a.id))}>
                        {selected.length === o.proposed.length ? 'Limpar seleção' : 'Selecionar todas'}
                      </Button>
                      <Button size="sm" icon={<CheckCheck className="size-3.5" />} disabled={selected.length === 0 || o.killSwitch} onClick={() => setConfirming(true)}>
                        Aplicar {selected.length || ''} selecionada(s)
                      </Button>
                    </>
                  )
                }
              />
              {o.proposed.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={<Plane className="size-5" />} title="Nada na fila" description='Clique em "Analisar agora" para o piloto buscar oportunidades nas suas contas.' />
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {o.proposed.map((a) => (
                    <ActionItem key={a.id} a={a} currency={o.currency} checked={selected.includes(a.id)} onToggle={() => toggle(a.id)} onDismiss={() => dismiss.mutate(a.id)} />
                  ))}
                </ul>
              )}
            </Card>
          )}

          {tab === 'terms' && (
            <div className="grid gap-6 xl:grid-cols-2">
              <TermsTable title="Gastam sem converter" rows={o.searchTerms.wasteful} empty="Nenhum termo desperdiçando verba." />
              <TermsTable title="Buscas que vendem" rows={o.searchTerms.converting} empty="Nenhum termo com conversões no período." />
            </div>
          )}

          {tab === 'history' && (
            <Card>
              <CardHeader title="Histórico" description="Ações aplicadas, descartadas ou com falha (registradas também na auditoria)." />
              {o.history.length === 0 ? (
                <p className="p-5 text-sm text-muted">Nenhuma ação ainda.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {o.history.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center gap-2 p-4 text-sm">
                      <Badge tone={a.status === 'applied' ? 'success' : a.status === 'failed' ? 'danger' : 'neutral'}>
                        {a.status === 'applied' ? (a.auto ? 'Aplicada (auto)' : 'Aplicada') : a.status === 'failed' ? 'Falhou' : 'Descartada'}
                      </Badge>
                      <span className="flex-1">{a.title}</span>
                      <span className="text-xs text-subtle">{formatDateTime(a.appliedAt ?? a.createdAt)}</span>
                      {a.error && <p className="w-full text-xs text-subtle">{a.error}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      )}
      <ConfirmDialog
        open={confirming}
        title={`Aplicar ${selected.length} ação(ões)?`}
        confirmLabel="Aplicar nas plataformas"
        message={
          org?.isDemo
            ? 'Demonstração: a aplicação é apenas simulada.'
            : 'As alterações serão enviadas ao Google Ads/Meta Ads agora (negativas, palavras-chave, pausas e orçamentos). Cada envio é registrado e não é repetido em duplicidade.'
        }
        loading={apply.isPending}
        onConfirm={() => apply.mutate(selected)}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}

function ActionItem({ a, currency, checked, onToggle, onDismiss }: { a: AutopilotAction; currency: string; checked: boolean; onToggle: () => void; onDismiss: () => void }) {
  const k = KIND[a.kind];
  const Icon = k.icon;
  return (
    <li className="flex gap-3 p-4">
      <input type="checkbox" className="mt-1" checked={checked} onChange={onToggle} aria-label={`Selecionar: ${a.title}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={k.tone}>
            <Icon className="size-3" /> {k.label}
          </Badge>
          <Badge tone={a.platform}>{PLATFORM_LABEL[a.platform]}</Badge>
          <p className="text-sm font-medium">{a.title}</p>
        </div>
        <p className="mt-1 text-sm text-muted">{a.rationale}</p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          <Badge tone="info">
            <CircleDollarSign className="size-3" /> {a.impact}
          </Badge>
          <Badge tone={a.confidence >= 0.85 ? 'success' : 'warning'}>Confiança {Math.round(a.confidence * 100)}%</Badge>
          {a.campaignName && <Badge>{a.campaignName}</Badge>}
          {Number(a.target.monthlySavings ?? 0) > 0 && <Badge>{formatCurrency(Number(a.target.monthlySavings), currency)}/mês</Badge>}
        </div>
        <details className="mt-2 text-xs text-subtle">
          <summary className="cursor-pointer">Evidências</summary>
          <ul className="mt-1 list-disc pl-4">
            {a.evidence.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </details>
      </div>
      <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} onClick={onDismiss} aria-label={`Descartar: ${a.title}`}>
        Descartar
      </Button>
    </li>
  );
}

function TermsTable({ title, rows, empty }: { title: string; rows: SearchTermRow[]; empty: string }) {
  return (
    <Card>
      <CardHeader title={title} />
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-muted">{empty}</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-subtle">
            <tr>
              <th className="px-4 py-2 font-medium">Termo</th>
              <th className="px-2 py-2 text-right font-medium">Cliques</th>
              <th className="px-2 py-2 text-right font-medium">Custo</th>
              <th className="px-4 py-2 text-right font-medium">Conv.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="selectable px-4 py-2">
                  {t.term}
                  {t.status !== 'NONE' && <Badge className="ml-2">{t.status === 'ADDED' ? 'palavra-chave' : t.status === 'EXCLUDED' ? 'negativado' : t.status}</Badge>}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">{formatNumber(t.clicks)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(t.spend, t.currency)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatNumber(t.conversions, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function SettingsCard({ settings, currency }: { settings: AutopilotSettings; currency: string }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [d, setD] = useState(settings);
  const [cpa, setCpa] = useState(settings.targetCpa?.toString() ?? '');
  useEffect(() => {
    setD(settings);
    setCpa(settings.targetCpa?.toString() ?? '');
  }, [settings]);
  const save = useMutation({
    mutationFn: () => api('autopilot.saveSettings', { organizationId, settings: { ...d, targetCpa: cpa.trim() ? Number(cpa.replace(',', '.')) : null } }),
    onSuccess: (data) => {
      qc.setQueryData(['autopilot', organizationId], data);
      toast.success('Configurações do piloto salvas.');
    },
    onError: (e) => toast.error(e),
  });
  const set = <K extends keyof AutopilotSettings>(k: K, v: AutopilotSettings[K]) => setD((x) => ({ ...x, [k]: v }));
  return (
    <Card>
      <CardHeader title="Configurações do piloto" description="Defina sua meta e o quanto o piloto pode fazer sozinho." />
      <form
        className="grid gap-4 p-5 md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label={`CPA alvo (${currency})`} htmlFor="ap-cpa" hint="Custo máximo aceitável por conversão.">
          <Input id="ap-cpa" inputMode="decimal" value={cpa} onChange={(e) => setCpa(e.target.value)} placeholder="ex.: 40" />
        </Field>
        <Field label="Cliques sem conversão p/ negativar" htmlFor="ap-clicks">
          <Input id="ap-clicks" type="number" min={3} value={d.minClicksNegative} onChange={(e) => set('minClicksNegative', Number(e.target.value))} />
        </Field>
        <Field label="Conversões p/ virar palavra-chave" htmlFor="ap-conv">
          <Input id="ap-conv" type="number" min={1} value={d.minConversionsKeyword} onChange={(e) => set('minConversionsKeyword', Number(e.target.value))} />
        </Field>
        <Field label="Passo de orçamento (%)" htmlFor="ap-step">
          <Input id="ap-step" type="number" min={5} max={50} value={d.budgetStepPct} onChange={(e) => set('budgetStepPct', Number(e.target.value))} />
        </Field>
        <div className="flex flex-col gap-2 text-sm md:col-span-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={d.aiRelevance} onChange={(e) => set('aiRelevance', e.target.checked)} />
            IA identifica buscas fora do seu negócio (emprego, grátis, tutoriais…)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={d.autoRunDaily} onChange={(e) => set('autoRunDaily', e.target.checked)} />
            Analisar sozinho uma vez por dia (com o app aberto)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={d.autoApplyNegatives} disabled={!d.autoRunDaily} onChange={(e) => set('autoApplyNegatives', e.target.checked)} />
            Aplicar negativas de alta confiança automaticamente (até 20 por dia; o resto fica para sua aprovação)
          </label>
        </div>
        <div className="flex items-end justify-end">
          <Button type="submit" loading={save.isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </Card>
  );
}
