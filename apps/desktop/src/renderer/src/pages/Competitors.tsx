import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Globe, Pencil, Plus, Radar, Sparkles, Tags, Trash2 } from 'lucide-react';
import { formatDateTime, type Competitor, type CompetitorReference, type ReferenceClassification } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { Badge, Button, Card, CardHeader, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Notice, PageHeader, Select, Textarea, useToast } from '../components/ui';

const CLASS_FIELDS: Array<{ key: keyof ReferenceClassification; label: string }> = [
  { key: 'promise', label: 'Promessa' },
  { key: 'concept', label: 'Conceito' },
  { key: 'audience', label: 'Público' },
  { key: 'format', label: 'Formato' },
  { key: 'positioning', label: 'Posicionamento' },
];

export function CompetitorsPage() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<Competitor | 'new' | null>(null);
  const [projectId, setProjectId] = useState('');
  const list = useQuery({ queryKey: ['competitors', organizationId], queryFn: () => api('competitor.list', { organizationId }) });
  const projects = useQuery({ queryKey: ['projects', organizationId, false], queryFn: () => api('project.list', { organizationId, includeArchived: false }) });
  const ai = useQuery({ queryKey: ['ai-config'], queryFn: () => api('ai.getConfig') });
  const analysis = useQuery({ queryKey: ['competitive-analysis', organizationId, projectId], queryFn: () => api('competitor.latestAnalysis', { organizationId, projectId: projectId || null }) });
  const analyze = useMutation({
    mutationFn: () => api('competitor.analyze', { organizationId, projectId: projectId || null }),
    onSuccess: (a) => {
      qc.setQueryData(['competitive-analysis', organizationId, projectId], a);
      toast.success('Análise competitiva gerada.');
    },
    onError: (e) => toast.error(e),
  });
  const refCount = list.data?.reduce((s, c) => s + c.references.length, 0) ?? 0;

  return (
    <>
      <PageHeader
        title="Concorrentes"
        description="Inteligência competitiva a partir de páginas públicas, com URL de origem e data de captura. Sem acesso a campanhas privadas e sem contornar login."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            Novo concorrente
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Radar className="size-4" /> Padrões e oportunidades
            </span>
          }
          description="A IA compara as referências capturadas (e o briefing do projeto, se escolhido) para apontar padrões e espaços de diferenciação."
          actions={
            <>
              <Select aria-label="Projeto da análise" className="w-56" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Sem projeto (geral)</option>
                {projects.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <Button icon={<Sparkles className="size-4" />} loading={analyze.isPending} disabled={!ai.data?.hasApiKey || refCount < 2} onClick={() => analyze.mutate()}>
                Analisar com IA
              </Button>
            </>
          }
        />
        <div className="p-5">
          {!ai.data?.hasApiKey && (
            <Notice tone="info" title="Provedor de IA não configurado">
              Configure a chave em Configurações para gerar análises. Captura e classificação manual funcionam sem IA.
            </Notice>
          )}
          {ai.data?.hasApiKey && refCount < 2 && <p className="text-sm text-muted">Capture ao menos duas referências públicas para analisar padrões.</p>}
          {analysis.data && (
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Padrões recorrentes', analysis.data.patterns],
                ['Oportunidades', analysis.data.opportunities],
                ['Ideias de diferenciação para testar', analysis.data.differentiationIdeas],
              ].map(([title, items]) => (
                <div key={title as string}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-subtle">{title as string}</p>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-muted">
                    {(items as string[]).map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="md:col-span-3">
                <p className="text-xs text-subtle">
                  Gerado em {formatDateTime(analysis.data.generatedAt)} com {analysis.data.model} · {analysis.data.referenceCount} referência(s). Ressalvas: {analysis.data.caveats.join(' ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {list.isLoading && <LoadingState />}
      {list.error && <ErrorState error={list.error} onRetry={() => void list.refetch()} />}
      {list.data?.length === 0 && (
        <EmptyState
          icon={<Globe className="size-5" />}
          title="Nenhum concorrente"
          description="Cadastre concorrentes e capture páginas públicas (site, landing pages, páginas de oferta) para comparar promessas e posicionamentos."
          action={
            <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
              Novo concorrente
            </Button>
          }
        />
      )}
      <div className="flex flex-col gap-4">
        {list.data?.map((c) => (
          <CompetitorCard key={c.id} competitor={c} hasAi={!!ai.data?.hasApiKey} onEdit={() => setEditing(c)} />
        ))}
      </div>
      {editing && <CompetitorForm competitor={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function CompetitorCard({ competitor: c, hasAi, onEdit }: { competitor: Competitor; hasAi: boolean; onEdit: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [url, setUrl] = useState(c.websiteUrl);
  const [classifying, setClassifying] = useState<CompetitorReference | null>(null);
  const [deleting, setDeleting] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ['competitors', organizationId] });
  const capture = useMutation({
    mutationFn: () => api('competitor.capture', { organizationId, competitorId: c.id, url }),
    onSuccess: async () => {
      toast.success('Página pública capturada.');
      await refresh();
    },
    onError: (e) => toast.error(e),
  });
  const aiClassify = useMutation({
    mutationFn: (id: string) => api('competitor.classifyAi', { organizationId, id }),
    onSuccess: async () => {
      toast.success('Referência classificada pela IA. Revise a classificação.');
      await refresh();
    },
    onError: (e) => toast.error(e),
  });
  const delRef = useMutation({
    mutationFn: (id: string) => api('competitor.deleteReference', { organizationId, id }),
    onSuccess: refresh,
    onError: (e) => toast.error(e),
  });
  const del = useMutation({
    mutationFn: () => api('competitor.delete', { organizationId, id: c.id }),
    onSuccess: async () => {
      toast.success('Concorrente excluído.');
      await refresh();
    },
    onError: (e) => toast.error(e),
  });

  return (
    <Card>
      <CardHeader
        title={c.name}
        description={[c.websiteUrl, c.projectName && `Projeto: ${c.projectName}`, c.notes].filter(Boolean).join(' · ') || undefined}
        actions={
          <>
            <Button size="sm" variant="ghost" aria-label={`Editar ${c.name}`} icon={<Pencil className="size-3.5" />} onClick={onEdit} />
            <Button size="sm" variant="ghost" aria-label={`Excluir ${c.name}`} icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(true)} />
          </>
        }
      />
      <div className="flex flex-col gap-3 p-5">
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            capture.mutate();
          }}
        >
          <Field label="URL pública para capturar" htmlFor={`cap-${c.id}`} className="min-w-72 flex-1">
            <Input id={`cap-${c.id}`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </Field>
          <Button type="submit" variant="secondary" icon={<Globe className="size-4" />} loading={capture.isPending} disabled={!/^https?:\/\//.test(url)}>
            Capturar página
          </Button>
        </form>
        {c.references.length === 0 && <p className="text-sm text-muted">Nenhuma referência capturada.</p>}
        {c.references.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-surface-2 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.title || r.sourceUrl}</p>
                <p className="truncate text-xs text-subtle selectable">
                  {r.sourceUrl} · capturada em {formatDateTime(r.capturedAt)}
                </p>
              </div>
              <div className="flex gap-1">
                {hasAi && (
                  <Button size="sm" variant="ghost" icon={<Sparkles className="size-3.5" />} loading={aiClassify.isPending && aiClassify.variables === r.id} onClick={() => aiClassify.mutate(r.id)}>
                    Classificar com IA
                  </Button>
                )}
                <Button size="sm" variant="ghost" icon={<Tags className="size-3.5" />} onClick={() => setClassifying(r)}>
                  Classificar
                </Button>
                <Button size="sm" variant="ghost" aria-label="Excluir referência" icon={<Trash2 className="size-3.5" />} onClick={() => delRef.mutate(r.id)} />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CLASS_FIELDS.filter((f) => r[f.key]).map((f) => (
                <Badge key={f.key} tone="brand">
                  {f.label}: {r[f.key]}
                </Badge>
              ))}
              {CLASS_FIELDS.every((f) => !r[f.key]) && <span className="text-xs text-subtle">Sem classificação.</span>}
            </div>
            {r.excerpt && <p className="mt-2 line-clamp-3 text-xs text-muted selectable">{r.excerpt}</p>}
          </div>
        ))}
      </div>
      {classifying && <ClassifyModal reference={classifying} onClose={() => setClassifying(null)} />}
      <ConfirmDialog open={deleting} danger title="Excluir concorrente?" message="O concorrente e todas as referências capturadas serão excluídos." confirmLabel="Excluir" loading={del.isPending} onConfirm={() => del.mutate()} onClose={() => setDeleting(false)} />
    </Card>
  );
}

function ClassifyModal({ reference, onClose }: { reference: CompetitorReference; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [d, setD] = useState<ReferenceClassification>({ promise: reference.promise, concept: reference.concept, audience: reference.audience, format: reference.format, positioning: reference.positioning });
  const save = useMutation({
    mutationFn: () => api('competitor.classify', { organizationId, id: reference.id, data: d }),
    onSuccess: async () => {
      toast.success('Classificação salva.');
      await qc.invalidateQueries({ queryKey: ['competitors', organizationId] });
      onClose();
    },
    onError: (e) => toast.error(e),
  });
  return (
    <Modal
      open
      onClose={onClose}
      title="Classificar referência"
      description={reference.sourceUrl}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {CLASS_FIELDS.map((f) => (
          <Field key={f.key} label={f.label} htmlFor={`cl-${f.key}`}>
            <Input id={`cl-${f.key}`} value={d[f.key]} maxLength={300} onChange={(e) => setD({ ...d, [f.key]: e.target.value })} />
          </Field>
        ))}
      </div>
    </Modal>
  );
}

function CompetitorForm({ competitor, onClose }: { competitor: Competitor | null; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const projects = useQuery({ queryKey: ['projects', organizationId, false], queryFn: () => api('project.list', { organizationId, includeArchived: false }) });
  const [d, setD] = useState({ name: competitor?.name ?? '', websiteUrl: competitor?.websiteUrl ?? '', notes: competitor?.notes ?? '', projectId: competitor?.projectId ?? '' });
  const save = useMutation({
    mutationFn: () => {
      const data = { ...d, projectId: d.projectId || null };
      return competitor ? api('competitor.update', { organizationId, id: competitor.id, data }) : api('competitor.create', { organizationId, data });
    },
    onSuccess: async () => {
      toast.success('Concorrente salvo.');
      await qc.invalidateQueries({ queryKey: ['competitors', organizationId] });
      onClose();
    },
    onError: (e) => toast.error(e),
  });
  return (
    <Modal
      open
      onClose={onClose}
      title={competitor ? 'Editar concorrente' : 'Novo concorrente'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Nome" htmlFor="cm-name" required>
          <Input id="cm-name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
        </Field>
        <Field label="Site" htmlFor="cm-site" hint="Página pública principal (opcional).">
          <Input id="cm-site" value={d.websiteUrl} onChange={(e) => setD({ ...d, websiteUrl: e.target.value })} placeholder="https://…" />
        </Field>
        <Field label="Projeto" htmlFor="cm-project">
          <Select id="cm-project" value={d.projectId} onChange={(e) => setD({ ...d, projectId: e.target.value })}>
            <option value="">Todos os projetos</option>
            {projects.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notas" htmlFor="cm-notes">
          <Textarea id="cm-notes" value={d.notes} onChange={(e) => setD({ ...d, notes: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}
