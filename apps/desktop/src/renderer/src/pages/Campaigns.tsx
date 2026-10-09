import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { CampaignInput, formatCurrency, formatDateTime, type Campaign, type Platform } from '@advertex/shared';
import { OBJECTIVES, objectiveLabel } from '@advertex/advertising-core';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { CAMPAIGN_STATUS_LABEL, PLATFORM_LABEL, SYNC_LABEL } from '../lib/labels';
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Notice, PageHeader, Select, Tabs, Textarea, useToast } from '../components/ui';

export function CampaignsPage() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [platform, setPlatform] = useState<Platform | 'all'>('all');
  const [editing, setEditing] = useState<Campaign | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Campaign | null>(null);
  const campaigns = useQuery({
    queryKey: ['campaigns', organizationId, platform],
    queryFn: () => api('campaign.list', { organizationId, platform: platform === 'all' ? null : platform }),
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
        <Notice tone="info" title="Publicação nas plataformas: Fase 5">
          Nesta versão, rascunhos ficam somente neste computador (nada é enviado às plataformas) e campanhas importadas são somente leitura. A publicação com validação, confirmação, limites de orçamento e auditoria
          está planejada para a Fase 5 (ver docs/ROADMAP.md).
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
                const local = c.syncState === 'local_only' && !c.remoteId;
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
                      {local ? (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" aria-label={`Editar ${c.name}`} icon={<Pencil className="size-3.5" />} onClick={() => setEditing(c)} />
                          <Button size="sm" variant="ghost" aria-label={`Excluir ${c.name}`} icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(c)} />
                        </div>
                      ) : (
                        <span className="block text-right text-xs text-subtle">somente leitura</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {editing && <CampaignFormModal campaign={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
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
