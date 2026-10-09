import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { CheckCircle2, History, ListTree, Megaphone, Pause, Pencil, Play, Plus, Send, Trash2, Wallet, XCircle } from 'lucide-react';
import { CampaignInput, formatCurrency, formatDateTime, type Campaign, type Platform, type PlatformOperation } from '@advertex/shared';
import { OBJECTIVES, objectiveLabel } from '@advertex/advertising-core';
import { api } from '../lib/api';
import { useOrg, useOrgId } from '../lib/org';
import { SearchStructureModal } from './SearchBuilder';
import { CAMPAIGN_STATUS_LABEL, PLATFORM_LABEL, SYNC_LABEL } from '../lib/labels';
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Notice, PageHeader, Select, Tabs, Textarea, useToast } from '../components/ui';

export function CampaignsPage() {
  const organizationId = useOrgId();
  const { org } = useOrg();
  const qc = useQueryClient();
  const toast = useToast();
  const [platform, setPlatform] = useState<Platform | 'all'>('all');
  const [editing, setEditing] = useState<Campaign | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Campaign | null>(null);
  const [publishing, setPublishing] = useState<Campaign | null>(null);
  const [statusChange, setStatusChange] = useState<{ campaign: Campaign; to: 'active' | 'paused' } | null>(null);
  const [budgetOf, setBudgetOf] = useState<Campaign | null>(null);
  const [historyOf, setHistoryOf] = useState<Campaign | null>(null);
  const [structureOf, setStructureOf] = useState<Campaign | null>(null);
  const campaigns = useQuery({
    queryKey: ['campaigns', organizationId, platform],
    queryFn: () => api('campaign.list', { organizationId, platform: platform === 'all' ? null : platform }),
  });
  const status = useMutation({
    mutationFn: ({ campaign, to }: { campaign: Campaign; to: 'active' | 'paused' }) => api('campaign.setRemoteStatus', { organizationId, id: campaign.id, status: to, confirm: true }),
    onSuccess: async (c) => {
      setStatusChange(null);
      toast.success(c.status === 'active' ? 'Campanha ativada na plataforma.' : 'Campanha pausada na plataforma.');
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: async (e) => {
      setStatusChange(null);
      toast.error(e);
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => api('campaign.delete', { organizationId, id }),
    onSuccess: async () => {
      setDeleting(null);
      toast.success('Rascunho excluído.');
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (e) => toast.error(e),
  });

  return (
    <>
      <PageHeader
        title="Campanhas"
        description="Visão unificada de campanhas Meta Ads e Google Ads: rascunhos locais e campanhas importadas das contas conectadas."
        actions={
          <>
            <Tabs
              value={platform}
              onChange={setPlatform}
              items={[
                { value: 'all', label: 'Todas' },
                { value: 'meta', label: 'Meta Ads' },
                { value: 'google', label: 'Google Ads' },
              ]}
            />
            <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
              Novo rascunho
            </Button>
          </>
        }
      />
      <div className="mb-5">
        <Notice tone="info" title="Publicação controlada">
          Rascunhos ficam neste computador até você publicá-los. Ao publicar, o app valida conta, moeda e limites, pede confirmação e cria a campanha <strong>pausada</strong> pela API
          oficial. Nada é marcado como publicado sem a confirmação da plataforma, e toda operação fica no histórico e na auditoria.
        </Notice>
      </div>

      {campaigns.isLoading && <LoadingState />}
      {campaigns.error && <ErrorState error={campaigns.error} onRetry={() => void campaigns.refetch()} />}
      {campaigns.data?.length === 0 && (
        <EmptyState
          icon={<Megaphone className="size-5" />}
          title="Nenhuma campanha"
          description="Crie um rascunho local para planejar, ou conecte uma conta em Integrações e importe as campanhas existentes."
          action={
            <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
              Novo rascunho
            </Button>
          }
        />
      )}
      {campaigns.data && campaigns.data.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs text-subtle">
              <tr>
                <th className="px-4 py-2.5 font-medium">Campanha</th>
                <th className="px-4 py-2.5 font-medium">Plataforma</th>
                <th className="px-4 py-2.5 font-medium">Objetivo</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Orçamento diário</th>
                <th className="px-4 py-2.5 font-medium">Sincronização</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {campaigns.data.map((c) => {
                const local = !c.remoteId && (c.syncState === 'local_only' || c.syncState === 'error');
                return (
                  <tr key={c.id} className="border-t border-border align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-subtle">
                        {c.projectName ? `Projeto: ${c.projectName}` : c.accountName ? `Conta: ${c.accountName}` : 'Sem projeto'}
                        {c.remoteId && <> · ID remoto {c.remoteId}</>}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={c.platform}>{PLATFORM_LABEL[c.platform]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{objectiveLabel(c.platform, c.objective)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={c.status === 'active' ? 'success' : c.status === 'paused' ? 'warning' : 'neutral'}>{CAMPAIGN_STATUS_LABEL[c.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(c.dailyBudget, c.currency)}</td>
                    <td className="px-4 py-3 text-xs">
                      <Badge tone={c.syncState === 'synced' ? 'info' : c.syncState === 'error' ? 'danger' : 'neutral'}>{SYNC_LABEL[c.syncState]}</Badge>
                      {c.lastSyncedAt && <p className="mt-1 text-subtle">{formatDateTime(c.lastSyncedAt)}</p>}
                      {c.lastError && <p className="mt-1 text-danger">{c.lastError}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {!c.remoteId && !org?.isDemo && (
                          <Button size="sm" variant="secondary" icon={<Send className="size-3.5" />} onClick={() => setPublishing(c)}>
                            {c.syncState === 'pending' ? 'Verificar e publicar' : 'Publicar'}
                          </Button>
                        )}
                        {c.platform === 'google' && c.objective === 'SEARCH' && !org?.isDemo && (
                          <Button size="sm" variant="secondary" icon={<ListTree className="size-3.5" />} onClick={() => setStructureOf(c)}>
                            Anúncios e palavras-chave
                          </Button>
                        )}
                        {c.remoteId && c.status === 'active' && (
                          <Button size="sm" variant="ghost" aria-label={`Pausar ${c.name}`} icon={<Pause className="size-3.5" />} onClick={() => setStatusChange({ campaign: c, to: 'paused' })} />
                        )}
                        {c.remoteId && c.status === 'paused' && (
                          <Button size="sm" variant="ghost" aria-label={`Ativar ${c.name}`} icon={<Play className="size-3.5" />} onClick={() => setStatusChange({ campaign: c, to: 'active' })} />
                        )}
                        {c.remoteId && (
                          <Button size="sm" variant="ghost" aria-label={`Orçamento de ${c.name}`} icon={<Wallet className="size-3.5" />} onClick={() => setBudgetOf(c)} />
                        )}
                        {!org?.isDemo && (
                          <Button size="sm" variant="ghost" aria-label={`Histórico de ${c.name}`} icon={<History className="size-3.5" />} onClick={() => setHistoryOf(c)} />
                        )}
                        {local && (
                          <>
                            <Button size="sm" variant="ghost" aria-label={`Editar ${c.name}`} icon={<Pencil className="size-3.5" />} onClick={() => setEditing(c)} />
                            <Button size="sm" variant="ghost" aria-label={`Excluir ${c.name}`} icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(c)} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {editing && <CampaignFormModal campaign={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {publishing && <PublishModal campaign={publishing} onClose={() => setPublishing(null)} />}
      {budgetOf && <BudgetModal campaign={budgetOf} onClose={() => setBudgetOf(null)} />}
      {historyOf && <HistoryModal campaign={historyOf} onClose={() => setHistoryOf(null)} />}
      {structureOf && <SearchStructureModal campaign={structureOf} onClose={() => setStructureOf(null)} />}
      <ConfirmDialog
        open={!!statusChange}
        danger={statusChange?.to === 'active'}
        title={statusChange?.to === 'active' ? 'Ativar campanha na plataforma?' : 'Pausar campanha na plataforma?'}
        confirmLabel={statusChange?.to === 'active' ? 'Ativar agora' : 'Pausar agora'}
        message={
          statusChange?.to === 'active'
            ? `"${statusChange.campaign.name}" passará a veicular e gastar orçamento (${formatCurrency(statusChange.campaign.dailyBudget, statusChange.campaign.currency)}/dia). Confirme que conjuntos/grupos e anúncios estão revisados na plataforma.`
            : `"${statusChange?.campaign.name}" deixará de veicular até ser reativada.`
        }
        loading={status.isPending}
        onConfirm={() => statusChange && status.mutate(statusChange)}
        onClose={() => setStatusChange(null)}
      />
      <ConfirmDialog
        open={!!deleting}
        danger
        title="Excluir rascunho?"
        confirmLabel="Excluir"
        message={`O rascunho local "${deleting?.name}" será excluído. Nada é alterado nas plataformas.`}
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

type FormIn = z.input<typeof CampaignInput>;
type FormOut = z.output<typeof CampaignInput>;

function CampaignFormModal({ campaign, onClose }: { campaign: Campaign | null; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const projects = useQuery({ queryKey: ['projects', organizationId, false], queryFn: () => api('project.list', { organizationId, includeArchived: false }) });
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(CampaignInput),
    defaultValues: campaign
      ? {
          projectId: campaign.projectId,
          platform: campaign.platform,
          name: campaign.name,
          objective: campaign.objective,
          dailyBudget: campaign.dailyBudget,
          currency: campaign.currency,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          notes: campaign.notes,
        }
      : { projectId: null, platform: 'meta', name: '', objective: 'OUTCOME_SALES', dailyBudget: null, currency: 'BRL', startDate: null, endDate: null, notes: '' },
  });
  const platform = form.watch('platform');
  const { errors } = form.formState;

  const save = useMutation({
    mutationFn: (data: FormOut) => (campaign ? api('campaign.update', { organizationId, id: campaign.id, data }) : api('campaign.create', { organizationId, data })),
    onSuccess: async () => {
      toast.success('Rascunho salvo localmente.');
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
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
      title={campaign ? 'Editar rascunho' : 'Novo rascunho de campanha'}
      description="Planejamento local. A estrutura de campanha difere entre Meta e Google; os objetivos exibidos são os da plataforma escolhida."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="campaign-form" loading={save.isPending}>
            Salvar rascunho
          </Button>
        </>
      }
    >
      <form id="campaign-form" className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((d) => save.mutate(d))}>
        <Field label="Nome" htmlFor="cp-name" required error={errors.name?.message} className="md:col-span-2">
          <Input id="cp-name" aria-invalid={!!errors.name} {...form.register('name')} />
        </Field>
        <Field label="Plataforma" htmlFor="cp-platform">
          <Select
            id="cp-platform"
            {...form.register('platform', {
              onChange: (e: { target: { value: Platform } }) => form.setValue('objective', OBJECTIVES[e.target.value][0]!.value),
            })}
          >
            <option value="meta">Meta Ads</option>
            <option value="google">Google Ads</option>
          </Select>
        </Field>
        <Field label={platform === 'google' ? 'Tipo de campanha' : 'Objetivo'} htmlFor="cp-obj" error={errors.objective?.message}>
          <Select id="cp-obj" {...form.register('objective')}>
            {OBJECTIVES[platform ?? 'meta'].map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Orçamento diário" htmlFor="cp-budget" error={errors.dailyBudget?.message}>
          <Input
            id="cp-budget"
            type="number"
            step="0.01"
            min="0"
            {...form.register('dailyBudget', { setValueAs: (v: string) => (v === '' || v === null ? null : Number(v)) })}
          />
        </Field>
        <Field label="Moeda" htmlFor="cp-cur" error={errors.currency?.message}>
          <Input id="cp-cur" maxLength={3} {...form.register('currency', { setValueAs: (v: string) => v.toUpperCase() })} />
        </Field>
        <Field label="Início" htmlFor="cp-start" error={errors.startDate?.message}>
          <Input id="cp-start" type="date" {...form.register('startDate', { setValueAs: nullable })} />
        </Field>
        <Field label="Término" htmlFor="cp-end" error={errors.endDate?.message}>
          <Input id="cp-end" type="date" {...form.register('endDate', { setValueAs: nullable })} />
        </Field>
        <Field label="Projeto" htmlFor="cp-project" className="md:col-span-2">
          <Select id="cp-project" {...form.register('projectId', { setValueAs: nullable })}>
            <option value="">Sem projeto</option>
            {projects.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notas" htmlFor="cp-notes" className="md:col-span-2">
          <Textarea id="cp-notes" {...form.register('notes')} />
        </Field>
      </form>
    </Modal>
  );
}

function PublishModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const integrations = useQuery({ queryKey: ['integrations', organizationId], queryFn: () => api('integration.list', { organizationId }) });
  const accounts = integrations.data?.find((i) => i.platform === campaign.platform)?.accounts ?? [];
  const [accountId, setAccountId] = useState<string>(campaign.advertisingAccountId ?? '');
  const [confirmed, setConfirmed] = useState(false);
  const check = useQuery({
    queryKey: ['preflight', campaign.id, accountId],
    queryFn: () => api('campaign.preflight', { organizationId, id: campaign.id, accountId: accountId || null }),
  });
  const publish = useMutation({
    mutationFn: () => api('campaign.publish', { organizationId, id: campaign.id, accountId, confirm: true }),
    onSuccess: async (c) => {
      toast.success(`Campanha criada (pausada) na plataforma — ID ${c.remoteId}.`);
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
      onClose();
    },
    onError: async (e) => {
      toast.error(e);
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Publicar "${campaign.name}"`}
      description={`Criação pela API oficial do ${PLATFORM_LABEL[campaign.platform]}. A campanha é criada PAUSADA.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button icon={<Send className="size-4" />} loading={publish.isPending} disabled={!check.data?.ok || !confirmed || !accountId} onClick={() => publish.mutate()}>
            Publicar pausada
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Conta de anúncios" htmlFor="pub-account" hint={accounts.length === 0 ? 'Nenhuma conta sincronizada. Conecte e sincronize em Integrações.' : undefined}>
          <Select id="pub-account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            <option value="">Selecione…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.remoteId}){a.currency ? ` · ${a.currency}` : ''}
              </option>
            ))}
          </Select>
        </Field>
        {check.isLoading && <LoadingState rows={2} />}
        {check.error && <ErrorState error={check.error} />}
        {check.data && (
          <ul className="flex flex-col gap-2" aria-label="Verificações antes de publicar">
            {check.data.items.map((i) => (
              <li key={i.label} className="flex items-start gap-2 text-sm">
                {i.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-label="ok" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-label="pendente" />}
                <span>
                  <span className="font-medium">{i.label}:</span> <span className="text-muted">{i.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <label className="flex items-start gap-2 rounded-lg border border-border bg-surface-2 p-3 text-sm">
          <input type="checkbox" className="mt-0.5" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          <span>Confirmo a criação desta campanha na conta selecionada. Entendo que conjuntos/grupos de anúncios e anúncios devem ser configurados e revisados antes de ativar.</span>
        </label>
      </div>
    </Modal>
  );
}

function BudgetModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const limits = useQuery({ queryKey: ['publishing-limits', organizationId], queryFn: () => api('publishing.getLimits', { organizationId }) });
  const [amount, setAmount] = useState(campaign.dailyBudget ? String(campaign.dailyBudget) : '');
  const value = Number(amount);
  const save = useMutation({
    mutationFn: () => api('campaign.updateRemoteBudget', { organizationId, id: campaign.id, amount: value, confirm: true }),
    onSuccess: async () => {
      toast.success('Orçamento atualizado na plataforma.');
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
      onClose();
    },
    onError: (e) => toast.error(e),
  });
  return (
    <Modal
      open
      onClose={onClose}
      title="Alterar orçamento diário"
      description={`Aplicado diretamente em ${PLATFORM_LABEL[campaign.platform]}. Atual: ${formatCurrency(campaign.dailyBudget, campaign.currency)}.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={save.isPending} disabled={!(value > 0)} onClick={() => save.mutate()}>
            Aplicar novo orçamento
          </Button>
        </>
      }
    >
      <Field
        label={`Novo orçamento diário (${campaign.currency})`}
        htmlFor="rb-amount"
        hint={
          limits.data
            ? `Limites da organização: máximo ${limits.data.maxDailyBudget === null ? 'sem limite' : formatCurrency(limits.data.maxDailyBudget, campaign.currency)} por campanha; aumento de até ${limits.data.maxBudgetIncreasePercent ?? '∞'}% por alteração.`
            : undefined
        }
      >
        <Input id="rb-amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
    </Modal>
  );
}

const OP_LABEL: Record<string, string> = {
  createCampaign: 'Criar campanha',
  pauseCampaign: 'Pausar',
  resumeCampaign: 'Ativar',
  updateBudget: 'Alterar orçamento',
  uploadImage: 'Enviar imagem',
};

const OP_STATUS: Record<PlatformOperation['status'], { label: string; tone: 'success' | 'danger' | 'warning' | 'neutral' }> = {
  succeeded: { label: 'Confirmada', tone: 'success' },
  failed: { label: 'Recusada', tone: 'danger' },
  unknown: { label: 'Resultado incerto', tone: 'warning' },
  pending: { label: 'Em andamento', tone: 'neutral' },
};

function HistoryModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const organizationId = useOrgId();
  const ops = useQuery({ queryKey: ['operations', campaign.id], queryFn: () => api('campaign.operations', { organizationId, id: campaign.id }) });
  return (
    <Modal open onClose={onClose} size="lg" title="Histórico de operações" description={`Escritas enviadas à plataforma para "${campaign.name}".`}>
      {ops.isLoading && <LoadingState rows={2} />}
      {ops.error && <ErrorState error={ops.error} />}
      {ops.data?.length === 0 && <p className="text-sm text-muted">Nenhuma operação enviada à plataforma.</p>}
      <ul className="flex flex-col gap-2">
        {ops.data?.map((o) => (
          <li key={o.id} className="rounded-lg border border-border bg-surface-2 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{OP_LABEL[o.operation] ?? o.operation}</span>
              <Badge tone={OP_STATUS[o.status].tone}>{OP_STATUS[o.status].label}</Badge>
            </div>
            <p className="mt-1 text-xs text-subtle">
              {formatDateTime(o.createdAt)}
              {o.remoteId && <> · ID remoto {o.remoteId}</>}
            </p>
            {o.error && <p className="mt-1 text-xs text-danger selectable">{o.error}</p>}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
