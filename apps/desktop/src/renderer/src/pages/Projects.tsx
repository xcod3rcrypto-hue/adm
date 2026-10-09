import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import { ProjectInput, formatDateTime, type Project } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { PROJECT_STATUS_LABEL } from '../lib/labels';
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Modal, PageHeader, Select, Textarea, useToast } from '../components/ui';

export function ProjectsPage() {
  const organizationId = useOrgId();
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<Project | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const projects = useQuery({
    queryKey: ['projects', organizationId, showArchived],
    queryFn: () => api('project.list', { organizationId, includeArchived: showArchived }),
  });

  const del = useMutation({
    mutationFn: (id: string) => api('project.delete', { organizationId, id }),
    onSuccess: async () => {
      setDeleting(null);
      toast.success('Projeto excluído.');
      await qc.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (e) => toast.error(e),
  });

  return (
    <>
      <PageHeader
        title="Projetos"
        description="Cada projeto reúne briefing, criativos, ativos e campanhas de uma iniciativa."
        actions={
          <>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="accent-[#7c5cff]" />
              Mostrar arquivados
            </label>
            <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
              Novo projeto
            </Button>
          </>
        }
      />

      {projects.isLoading && <LoadingState />}
      {projects.error && <ErrorState error={projects.error} onRetry={() => void projects.refetch()} />}
      {projects.data?.length === 0 && (
        <EmptyState
          icon={<FolderKanban className="size-5" />}
          title="Nenhum projeto ainda"
          description="Crie um projeto para registrar o briefing do negócio e começar a gerar criativos."
          action={
            <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
              Criar projeto
            </Button>
          }
        />
      )}
      {projects.data && projects.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.data.map((p) => (
            <Card key={p.id} className="group flex flex-col p-5 transition-colors hover:border-border-strong">
              <div className="flex items-start justify-between gap-2">
                <Link to={`/projetos/${p.id}`} className="font-semibold text-fg hover:text-[#b9a8ff]">
                  {p.name}
                </Link>
                <Badge tone={p.status === 'active' ? 'success' : p.status === 'paused' ? 'warning' : 'neutral'}>{PROJECT_STATUS_LABEL[p.status]}</Badge>
              </div>
              {p.clientName && <p className="mt-1 text-xs text-subtle">Cliente: {p.clientName}</p>}
              <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted">{p.objective || p.description || 'Sem objetivo definido.'}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-subtle">Atualizado {formatDateTime(p.updatedAt)}</span>
                <div className="flex gap-1 opacity-70 group-hover:opacity-100">
                  <Button variant="ghost" size="sm" aria-label={`Editar ${p.name}`} onClick={() => setEditing(p)} icon={<Pencil className="size-3.5" />} />
                  <Button variant="ghost" size="sm" aria-label={`Excluir ${p.name}`} onClick={() => setDeleting(p)} icon={<Trash2 className="size-3.5" />} />
                  <Link to={`/projetos/${p.id}`}>
                    <Button variant="secondary" size="sm">
                      Abrir
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && <ProjectFormModal project={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={!!deleting}
        title="Excluir projeto?"
        danger
        confirmLabel="Excluir definitivamente"
        loading={del.isPending}
        message={
          <>
            O projeto <b className="text-fg">{deleting?.name}</b> e seu briefing (com todas as versões) serão excluídos. Criativos, ativos e campanhas vinculados são mantidos, sem vínculo de projeto. Prefira
            arquivar se quiser apenas ocultá-lo.
          </>
        }
        onConfirm={() => deleting && del.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

type FormIn = z.input<typeof ProjectInput>;
type FormOut = z.output<typeof ProjectInput>;

export function ProjectFormModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [newClient, setNewClient] = useState('');
  const clients = useQuery({ queryKey: ['clients', organizationId], queryFn: () => api('client.list', { organizationId }) });

  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(ProjectInput),
    defaultValues: project
      ? { name: project.name, description: project.description, objective: project.objective, clientId: project.clientId, status: project.status }
      : { name: '', description: '', objective: '', clientId: null, status: 'active' },
  });
  const { errors } = form.formState;

  const save = useMutation({
    mutationFn: async (data: FormOut) => {
      let clientId = data.clientId;
      if (newClient.trim().length >= 2) clientId = (await api('client.create', { organizationId, data: { name: newClient.trim() } })).id;
      const payload = { ...data, clientId };
      return project ? api('project.update', { organizationId, id: project.id, data: payload }) : api('project.create', { organizationId, data: payload });
    },
    onSuccess: async () => {
      toast.success(project ? 'Projeto atualizado.' : 'Projeto criado.');
      await qc.invalidateQueries({ queryKey: ['projects'] });
      await qc.invalidateQueries({ queryKey: ['project'] });
      await qc.invalidateQueries({ queryKey: ['clients'] });
      await qc.invalidateQueries({ queryKey: ['onboarding'] });
      onClose();
    },
    onError: (e) => toast.error(e),
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={project ? 'Editar projeto' : 'Novo projeto'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="project-form" loading={save.isPending}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="project-form" className="flex flex-col gap-4" onSubmit={form.handleSubmit((d) => save.mutate(d))}>
        <Field label="Nome" htmlFor="p-name" required error={errors.name?.message}>
          <Input id="p-name" aria-invalid={!!errors.name} {...form.register('name')} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Cliente" htmlFor="p-client">
            <Select id="p-client" {...form.register('clientId', { setValueAs: (v: string) => (v ? v : null) })} disabled={newClient.length > 0}>
              <option value="">Sem cliente</option>
              {clients.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="…ou novo cliente" htmlFor="p-newclient" hint="Será criado ao salvar.">
            <Input id="p-newclient" value={newClient} onChange={(e) => setNewClient(e.target.value)} placeholder="Nome do cliente" maxLength={120} />
          </Field>
        </div>
        <Field label="Objetivo" htmlFor="p-objective" error={errors.objective?.message}>
          <Textarea id="p-objective" {...form.register('objective')} placeholder="O que este projeto precisa alcançar?" />
        </Field>
        <Field label="Descrição" htmlFor="p-desc" error={errors.description?.message}>
          <Textarea id="p-desc" {...form.register('description')} />
        </Field>
        <Field label="Situação" htmlFor="p-status">
          <Select id="p-status" {...form.register('status')}>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="archived">Arquivado</option>
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
