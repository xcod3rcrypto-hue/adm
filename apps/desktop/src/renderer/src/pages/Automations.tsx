import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, OctagonX, Pencil, Play, Plus, Power, ShieldAlert, Trash2, Workflow, X, Zap } from 'lucide-react';
import {
  formatDateTime,
  formatNumber,
  formatPercent,
  type AutomationAction,
  type AutomationCondition,
  type AutomationExecution,
  type AutomationFrequency,
  type AutomationMetric,
  type AutomationMode,
  type AutomationOperator,
  type AutomationRule,
  type AutomationRuleInput,
  type AutomationSimulation,
  type Platform,
} from '@advertex/shared';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { PLATFORM_LABEL } from '../lib/labels';
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Notice, PageHeader, Select, Tabs, useToast } from '../components/ui';
import { cn } from '../lib/cn';

export const MODE_LABEL: Record<AutomationMode, string> = {
  read_only: 'Somente alertas',
  recommend: 'Recomendações',
  approve: 'Execução com aprovação',
  auto_limited: 'Automática limitada',
};

const MODE_HELP: Record<AutomationMode, string> = {
  read_only: 'Apenas gera alertas. Nunca altera nada.',
  recommend: 'Cria recomendações em Inteligência para você decidir.',
  approve: 'Prepara a ação e espera sua aprovação explícita antes de executar.',
  auto_limited: 'Executa sozinha, dentro do teto da regra e dos limites da organização.',
};

const METRIC_LABEL: Record<AutomationMetric, string> = {
  spend: 'Investimento',
  conversions: 'Conversões',
  clicks: 'Cliques',
  impressions: 'Impressões',
  ctr: 'CTR (%)',
  cpc: 'CPC',
  cpa: 'CPA',
  roas: 'ROAS',
};
const OP_LABEL: Record<AutomationOperator, string> = { gt: 'maior que', gte: 'maior ou igual a', lt: 'menor que', lte: 'menor ou igual a', eq: 'igual a' };
const OP_SYMBOL: Record<AutomationOperator, string> = { gt: '>', gte: '≥', lt: '<', lte: '≤', eq: '=' };
const FREQ_LABEL: Record<AutomationFrequency, string> = { hourly: 'A cada hora', every_6_hours: 'A cada 6 horas', daily: 'Diariamente' };

const EXEC_STATUS: Record<AutomationExecution['status'], { label: string; tone: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand' }> = {
  simulated: { label: 'Simulada', tone: 'neutral' },
  pending_approval: { label: 'Aguardando aprovação', tone: 'warning' },
  running: { label: 'Em execução', tone: 'info' },
  succeeded: { label: 'Concluída', tone: 'success' },
  failed: { label: 'Falhou', tone: 'danger' },
  cancelled: { label: 'Não executada', tone: 'neutral' },
};

function conditionText(c: AutomationCondition): string {
  return `${METRIC_LABEL[c.metric].replace(' (%)', '')} ${OP_SYMBOL[c.operator]} ${c.metric === 'ctr' ? formatPercent(c.value, 2) : formatNumber(c.value, 2)}`;
}

function actionText(a: AutomationAction): string {
  if (a.type === 'notify') return 'Alertar';
  if (a.type === 'pause_campaign') return 'Pausar campanha';
  return `Orçamento ${a.changePercent > 0 ? '+' : ''}${a.changePercent}%`;
}

type Tab = 'rules' | 'executions' | 'alerts';

export function AutomationsPage() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('rules');
  const [editing, setEditing] = useState<AutomationRule | 'new' | null>(null);
  const [confirmKill, setConfirmKill] = useState(false);
  const overview = useQuery({ queryKey: ['automations', organizationId], queryFn: () => api('automation.overview', { organizationId }) });
  const unread = useQuery({ queryKey: ['notifications-unread', organizationId], queryFn: () => api('notification.unread', { organizationId }) });

  const kill = useMutation({
    mutationFn: (active: boolean) => api('automation.killSwitch', { organizationId, active }),
    onSuccess: async (o) => {
      setConfirmKill(false);
      qc.setQueryData(['automations', organizationId], o);
      toast.success(o.killSwitch ? 'Botão de emergência acionado: todas as automações foram paradas.' : 'Automações liberadas. Reative as regras desejadas individualmente.');
      await qc.invalidateQueries({ queryKey: ['notifications-unread', organizationId] });
    },
    onError: (e) => toast.error(e),
  });

  const ov = overview.data;
  return (
    <>
      <PageHeader
        title="Automações"
        description="Regras com gatilho, condições, janela de avaliação, frequência, ação, limites, expiração e aprovação. Simule antes de ativar; toda execução é auditada."
        actions={
          <>
            {ov && !ov.killSwitch && (
              <Button variant="danger" icon={<OctagonX className="size-4" />} onClick={() => setConfirmKill(true)}>
                Botão de emergência
              </Button>
            )}
            <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
              Nova regra
            </Button>
          </>
        }
      />

      {ov?.killSwitch && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-danger">
            <ShieldAlert className="size-5" /> Botão de emergência ativo: nenhuma automação é avaliada ou executada, e aprovações estão bloqueadas.
          </p>
          <Button variant="outline" icon={<Power className="size-4" />} loading={kill.isPending} onClick={() => kill.mutate(false)}>
            Liberar automações
          </Button>
        </div>
      )}
      {ov?.isDemo && (
        <div className="mb-5">
          <Notice tone="warning" title="Demonstração">
            Nesta organização, ações de pausa e orçamento são apenas simuladas: nada é enviado às plataformas.
          </Notice>
        </div>
      )}

      <div className="mb-5">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'rules', label: `Regras${ov ? ` (${ov.rules.length})` : ''}` },
            { value: 'executions', label: `Execuções${ov?.pendingApprovals ? ` · ${ov.pendingApprovals} aguardando aprovação` : ''}` },
            { value: 'alerts', label: `Alertas${unread.data ? ` (${unread.data} novo${unread.data > 1 ? 's' : ''})` : ''}` },
          ]}
        />
      </div>

      {overview.isLoading && <LoadingState />}
      {overview.error && <ErrorState error={overview.error} onRetry={() => void overview.refetch()} />}
      {ov && tab === 'rules' && <RulesTab rules={ov.rules} killSwitch={ov.killSwitch} onEdit={setEditing} />}
      {ov && tab === 'executions' && <ExecutionsTab executions={ov.executions} />}
      {tab === 'alerts' && <AlertsTab />}

      {editing && <RuleForm rule={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={confirmKill}
        danger
        title="Acionar o botão de emergência?"
        confirmLabel="Parar todas as automações"
        message="Todas as regras desta organização serão desligadas imediatamente, nenhuma ação será executada e aprovações pendentes ficarão bloqueadas até você liberar."
        loading={kill.isPending}
        onConfirm={() => kill.mutate(true)}
        onClose={() => setConfirmKill(false)}
      />
    </>
  );
}

function RulesTab({ rules, killSwitch, onEdit }: { rules: AutomationRule[]; killSwitch: boolean; onEdit: (r: AutomationRule | 'new') => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [deleting, setDeleting] = useState<AutomationRule | null>(null);
  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ['automations', organizationId] });
    await qc.invalidateQueries({ queryKey: ['notifications-unread', organizationId] });
  };
  const toggle = useMutation({
    mutationFn: (r: AutomationRule) => api('automation.setEnabled', { organizationId, id: r.id, enabled: !r.enabled }),
    onSuccess: async (r) => {
      toast.success(r.enabled ? 'Regra ativada.' : 'Regra desativada.');
      await refresh();
    },
    onError: (e) => toast.error(e),
  });
  const run = useMutation({
    mutationFn: (r: AutomationRule) => api('automation.runNow', { organizationId, id: r.id }),
    onSuccess: async (s) => {
      toast.info(s.message);
      await refresh();
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (e) => toast.error(e),
  });
  const del = useMutation({
    mutationFn: (id: string) => api('automation.delete', { organizationId, id }),
    onSuccess: async () => {
      setDeleting(null);
      toast.success('Regra excluída.');
      await refresh();
    },
    onError: (e) => toast.error(e),
  });

  if (rules.length === 0) {
    return (
      <EmptyState
        icon={<Workflow className="size-5" />}
        title="Nenhuma regra"
        description="Exemplo: “Se o investimento dos últimos 7 dias passar de R$ 300 com zero conversões, pedir aprovação para pausar a campanha”."
        action={
          <Button icon={<Plus className="size-4" />} onClick={() => onEdit('new')}>
            Nova regra
          </Button>
        }
      />
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {rules.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <Badge tone={r.enabled ? 'success' : 'neutral'}>{r.enabled ? 'Ativa' : 'Inativa'}</Badge>
                <Badge tone={r.mode === 'auto_limited' ? 'warning' : r.mode === 'approve' ? 'info' : 'brand'}>{MODE_LABEL[r.mode]}</Badge>
                {r.platform && <Badge tone={r.platform}>{PLATFORM_LABEL[r.platform]}</Badge>}
                {r.expiresAt && <Badge>Expira em {r.expiresAt}</Badge>}
              </div>
              <h3 className="text-sm font-semibold">{r.name}</h3>
              <p className="mt-1 text-sm text-muted">
                <span className="text-fg">Se</span> {r.conditions.map(conditionText).join(' e ')} nos últimos {r.windowDays} dia(s){' '}
                <span className="text-fg">então</span> {actionText(r.action)}
                {r.maxDailyBudget !== null && <> (teto {formatNumber(r.maxDailyBudget, 2)}/dia)</>}
              </p>
              <p className="mt-1 text-xs text-subtle">
                {FREQ_LABEL[r.frequency]} · {r.campaignIds.length === 0 ? 'todas as campanhas' : `${r.campaignIds.length} campanha(s)`} · última avaliação: {formatDateTime(r.lastRunAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="secondary" icon={<Play className="size-3.5" />} disabled={killSwitch} loading={run.isPending && run.variables?.id === r.id} onClick={() => run.mutate(r)}>
                Executar agora
              </Button>
              <Button size="sm" variant={r.enabled ? 'outline' : 'secondary'} icon={<Power className="size-3.5" />} disabled={killSwitch && !r.enabled} loading={toggle.isPending && toggle.variables?.id === r.id} onClick={() => toggle.mutate(r)}>
                {r.enabled ? 'Desativar' : 'Ativar'}
              </Button>
              <Button size="sm" variant="ghost" aria-label={`Editar ${r.name}`} icon={<Pencil className="size-3.5" />} onClick={() => onEdit(r)} />
              <Button size="sm" variant="ghost" aria-label={`Excluir ${r.name}`} icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(r)} />
            </div>
          </div>
        </Card>
      ))}
      <ConfirmDialog
        open={!!deleting}
        danger
        title="Excluir regra?"
        confirmLabel="Excluir"
        message={`A regra "${deleting?.name}" será excluída. O histórico de execuções permanece na auditoria.`}
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

function ExecutionsTab({ executions }: { executions: AutomationExecution[] }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const decide = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approve' | 'reject' }) => api('automation.decide', { organizationId, executionId: id, decision }),
    onSuccess: async (e) => {
      toast[e.status === 'failed' ? 'info' : 'success'](e.status === 'succeeded' ? `Executado: ${e.result ?? ''}` : e.status === 'cancelled' ? (e.error ?? e.result ?? 'Rejeitada.') : `Falhou: ${e.error ?? ''}`);
      await qc.invalidateQueries({ queryKey: ['automations', organizationId] });
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: async (e) => {
      toast.error(e);
      await qc.invalidateQueries({ queryKey: ['automations', organizationId] });
    },
  });
  if (executions.length === 0) return <EmptyState icon={<Zap className="size-5" />} title="Nenhuma execução" description="Execuções aparecem aqui quando uma regra é avaliada e alguma campanha atende às condições." />;
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-left text-xs text-subtle">
          <tr>
            <th className="px-4 py-2.5 font-medium">Quando</th>
            <th className="px-4 py-2.5 font-medium">Regra / campanha</th>
            <th className="px-4 py-2.5 font-medium">O que aconteceu</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {executions.map((e) => (
            <tr key={e.id} className="border-t border-border align-top">
              <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{formatDateTime(e.createdAt)}</td>
              <td className="px-4 py-3">
                <p className="font-medium">{e.ruleName}</p>
                <p className="text-xs text-subtle">{e.campaignName ?? '—'}</p>
              </td>
              <td className="px-4 py-3 text-xs">
                <p className="text-muted selectable">{e.summary}</p>
                {e.result && <p className="mt-1 text-fg">{e.result}</p>}
                {e.error && <p className="mt-1 text-danger">{e.error}</p>}
              </td>
              <td className="px-4 py-3">
                <Badge tone={EXEC_STATUS[e.status].tone}>{EXEC_STATUS[e.status].label}</Badge>
              </td>
              <td className="px-4 py-3">
                {e.status === 'pending_approval' && (
                  <div className="flex justify-end gap-1">
                    <Button size="sm" icon={<Check className="size-3.5" />} loading={decide.isPending && decide.variables?.id === e.id && decide.variables.decision === 'approve'} onClick={() => decide.mutate({ id: e.id, decision: 'approve' })}>
                      Aprovar
                    </Button>
                    <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} disabled={decide.isPending} onClick={() => decide.mutate({ id: e.id, decision: 'reject' })}>
                      Rejeitar
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function AlertsTab() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['notifications', organizationId], queryFn: () => api('notification.list', { organizationId }) });
  const mark = useMutation({
    mutationFn: () => api('notification.markRead', { organizationId, ids: null }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['notifications', organizationId] });
      await qc.invalidateQueries({ queryKey: ['notifications-unread', organizationId] });
    },
  });
  if (list.isLoading) return <LoadingState />;
  if (list.error) return <ErrorState error={list.error} />;
  if (!list.data?.length) return <EmptyState icon={<Bell className="size-5" />} title="Nenhum alerta" description="Alertas de regras, falhas e aprovações aparecem aqui." />;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" icon={<CheckCheck className="size-3.5" />} loading={mark.isPending} onClick={() => mark.mutate()}>
          Marcar todos como lidos
        </Button>
      </div>
      {list.data.map((n) => (
        <div key={n.id} className={cn('rounded-xl border p-3', n.readAt ? 'border-border bg-surface' : 'border-brand/40 bg-brand-soft/40')}>
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span className={cn('size-2 rounded-full', n.level === 'error' ? 'bg-danger' : n.level === 'warning' ? 'bg-warning' : 'bg-info')} aria-hidden />
              {n.title}
            </p>
            <span className="text-xs text-subtle">{formatDateTime(n.createdAt)}</span>
          </div>
          {n.body && <p className="mt-1 text-xs text-muted selectable">{n.body}</p>}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor de regra
// ---------------------------------------------------------------------------

interface DraftCondition {
  metric: AutomationMetric;
  operator: AutomationOperator;
  value: string;
}

function toInput(d: {
  name: string;
  mode: AutomationMode;
  platform: Platform | '';
  campaignIds: string[];
  conditions: DraftCondition[];
  windowDays: string;
  frequency: AutomationFrequency;
  actionType: AutomationAction['type'];
  changePercent: string;
  maxDailyBudget: string;
  expiresAt: string;
  enabled: boolean;
}): AutomationRuleInput {
  const action: AutomationAction = d.actionType === 'adjust_budget' ? { type: 'adjust_budget', changePercent: Number(d.changePercent) } : { type: d.actionType };
  return {
    name: d.name,
    mode: d.mode,
    platform: d.platform || null,
    campaignIds: d.campaignIds,
    // CTR é digitado em % e armazenado como fração.
    conditions: d.conditions.map((c) => ({ metric: c.metric, operator: c.operator, value: c.metric === 'ctr' ? Number(c.value) / 100 : Number(c.value) })),
    windowDays: Number(d.windowDays),
    frequency: d.frequency,
    action,
    maxDailyBudget: d.maxDailyBudget === '' ? null : Number(d.maxDailyBudget),
    expiresAt: d.expiresAt || null,
    enabled: d.enabled,
  };
}

function RuleForm({ rule, onClose }: { rule: AutomationRule | null; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const campaigns = useQuery({ queryKey: ['campaigns', organizationId, 'all'], queryFn: () => api('campaign.list', { organizationId, platform: null }) });
  const [d, setD] = useState(() => ({
    name: rule?.name ?? '',
    mode: rule?.mode ?? ('approve' as AutomationMode),
    platform: (rule?.platform ?? '') as Platform | '',
    campaignIds: rule?.campaignIds ?? [],
    conditions: rule?.conditions.map((c) => ({ metric: c.metric, operator: c.operator, value: String(c.metric === 'ctr' ? c.value * 100 : c.value) })) ?? [
      { metric: 'spend' as AutomationMetric, operator: 'gt' as AutomationOperator, value: '300' },
      { metric: 'conversions' as AutomationMetric, operator: 'eq' as AutomationOperator, value: '0' },
    ],
    windowDays: String(rule?.windowDays ?? 7),
    frequency: rule?.frequency ?? ('daily' as AutomationFrequency),
    actionType: rule?.action.type ?? ('pause_campaign' as AutomationAction['type']),
    changePercent: rule?.action.type === 'adjust_budget' ? String(rule.action.changePercent) : '-20',
    maxDailyBudget: rule?.maxDailyBudget === null || rule?.maxDailyBudget === undefined ? '' : String(rule.maxDailyBudget),
    expiresAt: rule?.expiresAt ?? '',
    enabled: rule?.enabled ?? false,
  }));
  const [sim, setSim] = useState<AutomationSimulation | null>(null);
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => {
    setD((prev) => ({ ...prev, [k]: v }));
    setSim(null);
  };
  const setCond = (i: number, patch: Partial<DraftCondition>) => set('conditions', d.conditions.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const simulate = useMutation({
    mutationFn: () => api('automation.simulate', { organizationId, data: toInput(d) }),
    onSuccess: setSim,
    onError: (e) => toast.error(e),
  });
  const save = useMutation({
    mutationFn: () => (rule ? api('automation.update', { organizationId, id: rule.id, data: toInput(d) }) : api('automation.create', { organizationId, data: toInput(d) })),
    onSuccess: async () => {
      toast.success('Regra salva.');
      await qc.invalidateQueries({ queryKey: ['automations', organizationId] });
      onClose();
    },
    onError: (e) => toast.error(e),
  });
  const scoped = (campaigns.data ?? []).filter((c) => !d.platform || c.platform === d.platform);

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={rule ? 'Editar regra' : 'Nova regra de automação'}
      description="Todas as condições precisam ser verdadeiras. Simule antes de ativar."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="secondary" icon={<Play className="size-4" />} loading={simulate.isPending} onClick={() => simulate.mutate()}>
            Simular
          </Button>
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            Salvar regra
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome" htmlFor="ar-name" required className="md:col-span-2">
          <Input id="ar-name" value={d.name} onChange={(e) => set('name', e.target.value)} maxLength={120} />
        </Field>
        <Field label="Modo" htmlFor="ar-mode" hint={MODE_HELP[d.mode]}>
          <Select
            id="ar-mode"
            value={d.mode}
            onChange={(e) => {
              const mode = e.target.value as AutomationMode;
              setD((p) => ({ ...p, mode, actionType: mode === 'read_only' ? 'notify' : p.actionType === 'notify' ? 'pause_campaign' : p.actionType }));
              setSim(null);
            }}
          >
            {(Object.keys(MODE_LABEL) as AutomationMode[]).map((m) => (
              <option key={m} value={m}>
                {MODE_LABEL[m]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ação" htmlFor="ar-action">
          <Select id="ar-action" value={d.actionType} onChange={(e) => set('actionType', e.target.value as AutomationAction['type'])}>
            <option value="notify">Alertar</option>
            {d.mode !== 'read_only' && <option value="pause_campaign">Pausar campanha</option>}
            {d.mode !== 'read_only' && <option value="adjust_budget">Ajustar orçamento diário</option>}
          </Select>
        </Field>
        {d.actionType === 'adjust_budget' && (
          <>
            <Field label="Variação do orçamento (%)" htmlFor="ar-pct" hint="Negativo reduz; positivo aumenta (máx. +100%).">
              <Input id="ar-pct" type="number" min="-90" max="100" step="1" value={d.changePercent} onChange={(e) => set('changePercent', e.target.value)} />
            </Field>
            <Field label="Teto de orçamento diário" htmlFor="ar-max" hint="Obrigatório para aumentos. A regra nunca define valor acima deste.">
              <Input id="ar-max" type="number" min="0" step="0.01" value={d.maxDailyBudget} onChange={(e) => set('maxDailyBudget', e.target.value)} />
            </Field>
          </>
        )}

        <div className="md:col-span-2">
          <p className="mb-2 text-xs font-medium text-muted">Condições</p>
          <div className="flex flex-col gap-2">
            {d.conditions.map((c, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <Select aria-label={`Métrica da condição ${i + 1}`} className="w-40" value={c.metric} onChange={(e) => setCond(i, { metric: e.target.value as AutomationMetric })}>
                  {(Object.keys(METRIC_LABEL) as AutomationMetric[]).map((m) => (
                    <option key={m} value={m}>
                      {METRIC_LABEL[m]}
                    </option>
                  ))}
                </Select>
                <Select aria-label={`Operador da condição ${i + 1}`} className="w-44" value={c.operator} onChange={(e) => setCond(i, { operator: e.target.value as AutomationOperator })}>
                  {(Object.keys(OP_LABEL) as AutomationOperator[]).map((o) => (
                    <option key={o} value={o}>
                      {OP_LABEL[o]}
                    </option>
                  ))}
                </Select>
                <Input aria-label={`Valor da condição ${i + 1}`} className="w-32" type="number" min="0" step="any" value={c.value} onChange={(e) => setCond(i, { value: e.target.value })} />
                {d.conditions.length > 1 && <Button size="sm" variant="ghost" aria-label="Remover condição" icon={<Trash2 className="size-3.5" />} onClick={() => set('conditions', d.conditions.filter((_, idx) => idx !== i))} />}
              </div>
            ))}
            {d.conditions.length < 5 && (
              <Button size="sm" variant="outline" className="self-start" icon={<Plus className="size-3.5" />} onClick={() => set('conditions', [...d.conditions, { metric: 'cpa', operator: 'gt', value: '50' }])}>
                Adicionar condição
              </Button>
            )}
          </div>
        </div>

        <Field label="Janela de avaliação (dias)" htmlFor="ar-window">
          <Input id="ar-window" type="number" min="1" max="90" value={d.windowDays} onChange={(e) => set('windowDays', e.target.value)} />
        </Field>
        <Field label="Frequência (com o app aberto)" htmlFor="ar-freq">
          <Select id="ar-freq" value={d.frequency} onChange={(e) => set('frequency', e.target.value as AutomationFrequency)}>
            {(Object.keys(FREQ_LABEL) as AutomationFrequency[]).map((f) => (
              <option key={f} value={f}>
                {FREQ_LABEL[f]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Plataforma" htmlFor="ar-platform">
          <Select
            id="ar-platform"
            value={d.platform}
            onChange={(e) => {
              setD((p) => ({ ...p, platform: e.target.value as Platform | '', campaignIds: [] }));
              setSim(null);
            }}
          >
            <option value="">Todas</option>
            <option value="meta">Meta Ads</option>
            <option value="google">Google Ads</option>
          </Select>
        </Field>
        <Field label="Expira em" htmlFor="ar-exp" hint="Opcional. Depois desta data a regra não é avaliada.">
          <Input id="ar-exp" type="date" value={d.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
        </Field>

        <fieldset className="md:col-span-2">
          <legend className="mb-2 text-xs font-medium text-muted">Campanhas no escopo (nenhuma marcada = todas)</legend>
          <div className="grid max-h-40 gap-1 overflow-y-auto rounded-lg border border-border bg-surface-2 p-2 sm:grid-cols-2">
            {scoped.length === 0 && <p className="text-xs text-subtle">Nenhuma campanha.</p>}
            {scoped.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={d.campaignIds.includes(c.id)}
                  onChange={(e) => set('campaignIds', e.target.checked ? [...d.campaignIds, c.id] : d.campaignIds.filter((x) => x !== c.id))}
                />
                <span className="truncate">{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" checked={d.enabled} onChange={(e) => set('enabled', e.target.checked)} />
          Ativar a regra ao salvar (avaliada automaticamente na frequência escolhida)
        </label>

        {sim && (
          <div className="md:col-span-2" aria-label="Resultado da simulação">
            <Notice tone="info" title={`Simulação: ${sim.matches.length} de ${sim.evaluatedCampaigns} campanha(s) atenderiam às condições (${sim.window.from} a ${sim.window.to})`}>
              <ul className="mt-1 list-disc pl-4">
                {sim.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </Notice>
            {sim.matches.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1.5">
                {sim.matches.map((m) => (
                  <li key={m.campaignId} className="rounded-lg border border-border bg-surface-2 p-2.5 text-xs">
                    <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                      {m.campaignName} <Badge tone={m.platform}>{PLATFORM_LABEL[m.platform]}</Badge>
                    </p>
                    <p className="mt-0.5 text-muted">
                      Investimento {formatNumber(m.metrics.spend, 2)} · Conversões {formatNumber(m.metrics.conversions, 1)} · CPA {formatNumber(m.metrics.cpa, 2)} · CTR {formatPercent(m.metrics.ctr)}
                    </p>
                    <p className="mt-0.5">
                      <span className="text-fg">Ação:</span> {m.plannedAction}
                      {m.blockedReason && <span className="text-warning"> — não seria executada: {m.blockedReason}</span>}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
