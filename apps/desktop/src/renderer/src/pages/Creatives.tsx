import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Download, UploadCloud, FileText, GitCompare, ImagePlus, Images, Pencil, Plus, Send, Settings2, Sparkles, Tag, Trash2, XCircle } from 'lucide-react';
import { CreativeKind, FunnelStage, formatBytes, type ImageAspectRatio, formatDateTime, type Asset, type Creative, type CreativeStatus } from '@advertex/shared';
import { validateText } from '@advertex/advertising-core';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { useNavigate } from 'react-router-dom';
import { CREATIVE_STATUS_LABEL, KIND_LABEL, KIND_PLATFORM, PLATFORM_LABEL, STAGE_LABEL } from '../lib/labels';
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Modal, PageHeader, Select, Tabs, Textarea, useToast } from '../components/ui';

type Tab = 'texts' | 'assets';

export function CreativesPage() {
  const [tab, setTab] = useState<Tab>('texts');
  return (
    <>
      <PageHeader title="Criativos" description="Biblioteca de textos e arquivos, com versões, aprovação e busca." />
      <div className="mb-5">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'texts', label: 'Textos' },
            { value: 'assets', label: 'Imagens e vídeos' },
          ]}
        />
      </div>
      {tab === 'texts' ? <TextsTab /> : <AssetsTab />}
    </>
  );
}

const STATUS_TONE: Record<CreativeStatus, 'neutral' | 'info' | 'success' | 'danger'> = { draft: 'neutral', in_review: 'info', approved: 'success', rejected: 'danger' };

function TextsTab() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<CreativeStatus | ''>('');
  const [tag, setTag] = useState('');
  const [editing, setEditing] = useState<Creative | 'new' | null>(null);
  const [versionsOf, setVersionsOf] = useState<Creative | null>(null);
  const [deleting, setDeleting] = useState<Creative | null>(null);

  const projects = useQuery({ queryKey: ['projects', organizationId, true], queryFn: () => api('project.list', { organizationId, includeArchived: true }) });
  const creatives = useQuery({
    queryKey: ['creatives', organizationId, { search, projectId, status, tag }],
    queryFn: () => api('creative.list', { organizationId, search, projectId: projectId || null, status: status || null, tag }),
  });

  const setStatusMut = useMutation({
    mutationFn: ({ id, s }: { id: string; s: CreativeStatus }) => api('creative.setStatus', { organizationId, id, status: s }),
    onSuccess: async (c) => {
      toast.success(`Status: ${CREATIVE_STATUS_LABEL[c.status]}.`);
      await qc.invalidateQueries({ queryKey: ['creatives'] });
    },
    onError: (e) => toast.error(e),
  });
  const del = useMutation({
    mutationFn: (id: string) => api('creative.delete', { organizationId, id }),
    onSuccess: async () => {
      setDeleting(null);
      toast.success('Criativo excluído.');
      await qc.invalidateQueries({ queryKey: ['creatives'] });
    },
    onError: (e) => toast.error(e),
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Buscar" htmlFor="c-search" className="w-64">
          <Input id="c-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Título ou texto" />
        </Field>
        <Field label="Projeto" htmlFor="c-proj" className="w-52">
          <Select id="c-proj" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Todos</option>
            {projects.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="c-status" className="w-40">
          <Select id="c-status" value={status} onChange={(e) => setStatus(e.target.value as CreativeStatus | '')}>
            <option value="">Todos</option>
            {(Object.keys(CREATIVE_STATUS_LABEL) as CreativeStatus[]).map((s) => (
              <option key={s} value={s}>
                {CREATIVE_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tag" htmlFor="c-tag" className="w-36">
          <Input id="c-tag" value={tag} onChange={(e) => setTag(e.target.value.toLowerCase())} placeholder="ex.: ia" />
        </Field>
        <div className="flex-1" />
        <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
          Novo criativo
        </Button>
      </div>

      {creatives.isLoading && <LoadingState />}
      {creatives.error && <ErrorState error={creatives.error} onRetry={() => void creatives.refetch()} />}
      {creatives.data?.length === 0 && (
        <EmptyState
          icon={<FileText className="size-5" />}
          title={search || projectId || status || tag ? 'Nenhum criativo encontrado com esses filtros' : 'Biblioteca vazia'}
          description="Crie manualmente ou gere variações no Estúdio de IA e salve-as aqui."
        />
      )}
      <div className="grid gap-3">
        {creatives.data?.map((c) => {
          const check = validateText(c.kind, c.body);
          return (
            <Card key={c.id} className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{c.title}</h3>
                    <Badge tone={STATUS_TONE[c.status]}>{CREATIVE_STATUS_LABEL[c.status]}</Badge>
                    {c.platform && <Badge tone={c.platform}>{PLATFORM_LABEL[c.platform]}</Badge>}
                    <Badge>{KIND_LABEL[c.kind]}</Badge>
                    {c.source === 'ai' && <Badge tone="brand">IA</Badge>}
                    <span className="text-xs text-subtle">v{c.version}</span>
                  </div>
                  <p className="selectable mt-2 whitespace-pre-wrap text-sm text-fg/90">{c.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle">
                    {[
                      c.projectName && `Projeto: ${c.projectName}`,
                      c.funnelStage && STAGE_LABEL[c.funnelStage],
                      formatDateTime(c.updatedAt),
                      c.assetIds.length > 0 && `${c.assetIds.length} ativo(s)`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    {check.limit && <span className={check.withinLimit ? '' : 'text-warning'}>· {check.count}/{check.limit} caracteres</span>}
                    {c.tags.map((t) => (
                      <Badge key={t}>#{t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  {c.status === 'draft' && (
                    <Button size="sm" variant="outline" icon={<Send className="size-3.5" />} onClick={() => setStatusMut.mutate({ id: c.id, s: 'in_review' })}>
                      Enviar p/ revisão
                    </Button>
                  )}
                  {c.status !== 'approved' && (
                    <Button size="sm" variant="outline" icon={<CheckCircle2 className="size-3.5" />} onClick={() => setStatusMut.mutate({ id: c.id, s: 'approved' })}>
                      Aprovar
                    </Button>
                  )}
                  {c.status === 'in_review' && (
                    <Button size="sm" variant="outline" icon={<XCircle className="size-3.5" />} onClick={() => setStatusMut.mutate({ id: c.id, s: 'rejected' })}>
                      Reprovar
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" aria-label="Histórico" icon={<GitCompare className="size-3.5" />} onClick={() => setVersionsOf(c)} />
                  <Button size="sm" variant="ghost" aria-label="Editar" icon={<Pencil className="size-3.5" />} onClick={() => setEditing(c)} />
                  <Button size="sm" variant="ghost" aria-label="Excluir" icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(c)} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {editing && <CreativeFormModal creative={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {versionsOf && <VersionsModal creative={versionsOf} onClose={() => setVersionsOf(null)} />}
      <ConfirmDialog
        open={!!deleting}
        danger
        title="Excluir criativo?"
        confirmLabel="Excluir"
        message={`"${deleting?.title}" e todo o seu histórico de versões serão excluídos.`}
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

function CreativeFormModal({ creative, onClose }: { creative: Creative | null; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [title, setTitle] = useState(creative?.title ?? '');
  const [kind, setKind] = useState<CreativeKind>(creative?.kind ?? 'meta_primary_text');
  const [stage, setStage] = useState<FunnelStage | ''>(creative?.funnelStage ?? '');
  const [body, setBody] = useState(creative?.body ?? '');
  const [cta, setCta] = useState(creative?.cta ?? '');
  const [tags, setTags] = useState((creative?.tags ?? []).join(', '));
  const [projectId, setProjectId] = useState(creative?.projectId ?? '');
  const [assetIds, setAssetIds] = useState<string[]>(creative?.assetIds ?? []);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const projects = useQuery({ queryKey: ['projects', organizationId, true], queryFn: () => api('project.list', { organizationId, includeArchived: true }) });
  const assets = useQuery({ queryKey: ['assets', organizationId, '', ''], queryFn: () => api('asset.list', { organizationId, projectId: null, search: '' }) });
  const check = validateText(kind, body);

  const save = useMutation({
    mutationFn: () => {
      const data = {
        projectId: projectId || null,
        title,
        kind,
        platform: KIND_PLATFORM[kind],
        funnelStage: stage || null,
        body,
        cta,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        assetIds,
      };
      return creative ? api('creative.update', { organizationId, id: creative.id, data: { ...data, source: creative.source }, note }) : api('creative.create', { organizationId, data });
    },
    onSuccess: async () => {
      toast.success(creative ? 'Criativo atualizado.' : 'Criativo criado.');
      await qc.invalidateQueries({ queryKey: ['creatives'] });
      onClose();
    },
    onError: (e) => {
      const fe = (e as { fieldErrors?: Record<string, string[]> }).fieldErrors;
      if (fe) setErrors(fe);
      toast.error(e);
    },
  });

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={creative ? 'Editar criativo' : 'Novo criativo'}
      description={creative?.status === 'approved' ? 'Alterar o texto de um criativo aprovado cria uma nova versão e o devolve para rascunho.' : undefined}
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
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título interno" htmlFor="cf-title" required error={errors['data.title']?.[0]} className="md:col-span-2">
          <Input id="cf-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        </Field>
        <Field label="Formato" htmlFor="cf-kind">
          <Select id="cf-kind" value={kind} onChange={(e) => setKind(e.target.value as CreativeKind)}>
            {CreativeKind.options.map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Etapa do funil" htmlFor="cf-stage">
          <Select id="cf-stage" value={stage} onChange={(e) => setStage(e.target.value as FunnelStage | '')}>
            <option value="">Não definida</option>
            {FunnelStage.options.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Texto"
          htmlFor="cf-body"
          required
          className="md:col-span-2"
          error={errors['data.body']?.[0]}
          hint={
            <span className={check.withinLimit ? '' : 'text-warning'}>
              {check.count}
              {check.limit ? `/${check.limit}` : ''} caracteres{check.message ? ` — ${check.message}` : ''}
            </span>
          }
        >
          <Textarea id="cf-body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[120px]" maxLength={5000} />
        </Field>
        <Field label="CTA" htmlFor="cf-cta">
          <Input id="cf-cta" value={cta} onChange={(e) => setCta(e.target.value)} maxLength={60} placeholder="Ex.: Saiba mais" />
        </Field>
        <Field label="Projeto" htmlFor="cf-project">
          <Select id="cf-project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Sem projeto</option>
            {projects.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tags (separadas por vírgula)" htmlFor="cf-tags" className="md:col-span-2">
          <Input id="cf-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="promo, verão, feed" />
        </Field>
        {creative && (
          <Field label="Nota da versão (opcional)" htmlFor="cf-note" className="md:col-span-2">
            <Input id="cf-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
          </Field>
        )}
        <div className="md:col-span-2">
          <p className="mb-2 text-xs font-medium text-muted">Ativos vinculados</p>
          {assets.data?.length === 0 && <p className="text-xs text-subtle">Nenhum ativo na biblioteca. Importe imagens/vídeos na aba “Imagens e vídeos”.</p>}
          <div className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto">
            {assets.data?.map((a) => {
              const on = assetIds.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setAssetIds((ids) => (on ? ids.filter((x) => x !== a.id) : [...ids, a.id]))}
                  className={`relative overflow-hidden rounded-lg border-2 ${on ? 'border-brand' : 'border-transparent'}`}
                  title={a.fileName}
                >
                  <AssetThumb asset={a} className="h-20" />
                  {on && <CheckCircle2 className="absolute right-1 top-1 size-4 text-brand" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function VersionsModal({ creative, onClose }: { creative: Creative; onClose: () => void }) {
  const organizationId = useOrgId();
  const versions = useQuery({ queryKey: ['creative-versions', creative.id], queryFn: () => api('creative.versions', { organizationId, id: creative.id }) });
  const [a, setA] = useState<number | null>(null);
  const list = versions.data ?? [];
  const current = list[0];
  const compare = list.find((v) => v.version === a) ?? list[1];

  return (
    <Modal open onClose={onClose} size="xl" title={`Histórico — ${creative.title}`} description="Compare a versão atual com uma versão anterior.">
      {versions.isLoading && <LoadingState />}
      {versions.error && <ErrorState error={versions.error} />}
      {list.length === 1 && <p className="text-sm text-muted">Este criativo tem apenas a versão inicial.</p>}
      {current && compare && list.length > 1 && (
        <>
          <Field label="Comparar com" htmlFor="v-cmp" className="mb-4 w-56">
            <Select id="v-cmp" value={compare.version} onChange={(e) => setA(Number(e.target.value))}>
              {list.slice(1).map((v) => (
                <option key={v.id} value={v.version}>
                  v{v.version} — {formatDateTime(v.createdAt)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="selectable grid grid-cols-2 gap-4">
            {[compare, current].map((v, i) => (
              <Card key={v.id} className="p-4">
                <p className="mb-2 text-xs font-medium text-subtle">
                  {i === 0 ? 'Antes' : 'Atual'} · v{v.version} · {formatDateTime(v.createdAt)}
                </p>
                <p className="font-medium">{v.title}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{v.body}</p>
                {v.cta && <p className="mt-2 text-xs text-muted">CTA: {v.cta}</p>}
                {v.note && <p className="mt-2 text-xs text-subtle">Nota: {v.note}</p>}
              </Card>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}

export function AssetThumb({ asset, className }: { asset: Asset; className?: string }) {
  const src = `advertex-asset://${asset.id}/`;
  return asset.mimeType.startsWith('video/') ? (
    <video src={src} className={`w-full bg-black object-cover ${className ?? ''}`} muted preload="metadata" />
  ) : (
    <img src={src} alt={asset.fileName} loading="lazy" className={`w-full bg-surface-3 object-cover ${className ?? ''}`} />
  );
}

function AssetsTab() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [tagging, setTagging] = useState<Asset | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [deleting, setDeleting] = useState<Asset | null>(null);
  const [uploading, setUploading] = useState<Asset | null>(null);
  const [generating, setGenerating] = useState(false);
  const assets = useQuery({ queryKey: ['assets', organizationId, search], queryFn: () => api('asset.list', { organizationId, projectId: null, search }) });

  const importMut = useMutation({
    mutationFn: () => api('asset.import', { organizationId, projectId: null }),
    onSuccess: async (list) => {
      if (list.length) toast.success(`${list.length} arquivo(s) importado(s).`);
      await qc.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (e) => toast.error(e),
  });
  const tagMut = useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) => api('asset.updateTags', { organizationId, id, tags }),
    onSuccess: async () => {
      setTagging(null);
      await qc.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (e) => toast.error(e),
  });
  const exportMut = useMutation({
    mutationFn: (id: string) => api('asset.export', { organizationId, id }),
    onSuccess: (r) => r.savedTo && toast.success(`Exportado para ${r.savedTo}`),
    onError: (e) => toast.error(e),
  });
  const del = useMutation({
    mutationFn: (id: string) => api('asset.delete', { organizationId, id }),
    onSuccess: async () => {
      setDeleting(null);
      toast.success('Ativo excluído.');
      await qc.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (e) => toast.error(e),
  });

  const total = useMemo(() => (assets.data ?? []).reduce((s, a) => s + a.sizeBytes, 0), [assets.data]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Buscar" htmlFor="a-search" className="w-64">
          <Input id="a-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome do arquivo ou tag" />
        </Field>
        <p className="pb-2.5 text-xs text-subtle">
          {assets.data?.length ?? 0} arquivo(s) · {formatBytes(total)} · PNG, JPG, GIF, WEBP, MP4, MOV, WEBM até 50 MB
        </p>
        <div className="flex-1" />
        <Button variant="outline" icon={<Sparkles className="size-4" />} onClick={() => setGenerating(true)}>
          Gerar imagem com IA
        </Button>
        <Button icon={<ImagePlus className="size-4" />} loading={importMut.isPending} onClick={() => importMut.mutate()}>
          Importar arquivos
        </Button>
      </div>
      {assets.isLoading && <LoadingState />}
      {assets.error && <ErrorState error={assets.error} />}
      {assets.data?.length === 0 && <EmptyState icon={<Images className="size-5" />} title="Nenhum arquivo" description="Importe imagens e vídeos para organizar e vincular aos criativos." />}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {assets.data?.map((a) => (
          <Card key={a.id} className="overflow-hidden">
            <AssetThumb asset={a} className="h-40" />
            <div className="p-3">
              <p className="truncate text-sm font-medium" title={a.fileName}>
                {a.fileName}
              </p>
              <p className="text-xs text-subtle">
                {a.width && a.height ? `${a.width}×${a.height} · ` : ''}
                {formatBytes(a.sizeBytes)} · {a.mimeType.split('/')[1]?.toUpperCase()}
              </p>
              <div className="mt-2 flex min-h-5 flex-wrap gap-1">
                {a.tags.map((t) => (
                  <Badge key={t}>#{t}</Badge>
                ))}
              </div>
              <div className="mt-2 flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Editar tags"
                  icon={<Tag className="size-3.5" />}
                  onClick={() => {
                    setTagging(a);
                    setTagInput(a.tags.join(', '));
                  }}
                />
                <Button size="sm" variant="ghost" aria-label="Exportar" icon={<Download className="size-3.5" />} onClick={() => exportMut.mutate(a.id)} />
                {a.mimeType.startsWith('image/') && (
                  <Button size="sm" variant="ghost" aria-label="Enviar para conta de anúncios" icon={<UploadCloud className="size-3.5" />} onClick={() => setUploading(a)} />
                )}
                <Button size="sm" variant="ghost" aria-label="Excluir" icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(a)} />
              </div>
            </div>
          </Card>
        ))}
      </div>
      {tagging && (
        <Modal
          open
          onClose={() => setTagging(null)}
          title="Tags do ativo"
          footer={
            <Button
              loading={tagMut.isPending}
              onClick={() =>
                tagMut.mutate({
                  id: tagging.id,
                  tags: tagInput
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            >
              Salvar
            </Button>
          }
        >
          <Field label="Tags separadas por vírgula" htmlFor="a-tags">
            <Input id="a-tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
          </Field>
        </Modal>
      )}
      {uploading && <UploadToPlatformModal asset={uploading} onClose={() => setUploading(null)} />}
      {generating && <GenerateImageModal images={(assets.data ?? []).filter((a) => a.mimeType.startsWith('image/'))} onClose={() => setGenerating(false)} />}
      <ConfirmDialog
        open={!!deleting}
        danger
        title="Excluir arquivo?"
        confirmLabel="Excluir"
        message={`"${deleting?.fileName}" será removido da biblioteca e do disco.`}
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

const ASPECT_OPTIONS: Array<{ value: ImageAspectRatio; label: string }> = [
  { value: '1:1', label: '1:1 — Feed quadrado' },
  { value: '4:5', label: '4:5 — Feed vertical (Meta)' },
  { value: '9:16', label: '9:16 — Stories / Reels' },
  { value: '16:9', label: '16:9 — Display / YouTube' },
  { value: '4:3', label: '4:3 — Paisagem' },
  { value: '3:4', label: '3:4 — Retrato' },
];

function GenerateImageModal({ images, onClose }: { images: Asset[]; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const cfg = useQuery({ queryKey: ['image-ai-config'], queryFn: () => api('image.getConfig') });
  const projects = useQuery({ queryKey: ['projects', organizationId, false], queryFn: () => api('project.list', { organizationId, includeArchived: false }) });
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [count, setCount] = useState(1);
  const [useBrief, setUseBrief] = useState(true);
  const [withText, setWithText] = useState(false);
  const [refs, setRefs] = useState<string[]>([]);

  const gen = useMutation({
    mutationFn: () =>
      api('image.generate', {
        organizationId,
        request: { projectId: projectId || null, description, aspectRatio, imageSize, count, useBrief, withText, referenceAssetIds: refs },
      }),
    onSuccess: async (r) => {
      await qc.invalidateQueries({ queryKey: ['assets'] });
      if (r.assets.length) toast.success(`${r.assets.length} imagem(ns) criada(s) e salva(s) na biblioteca.`);
    },
    onError: (e) => toast.error(e),
  });

  const isPro = cfg.data?.model.includes('pro') ?? true;
  const noKey = cfg.data && !cfg.data.hasApiKey;

  return (
    <Modal
      open
      size="xl"
      onClose={onClose}
      title="Gerar imagem com IA (Gemini)"
      description={cfg.data ? `Modelo: ${cfg.data.models.find((m) => m.id === cfg.data.model)?.label ?? cfg.data.model}` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          <Button icon={<Sparkles className="size-4" />} loading={gen.isPending} disabled={!!noKey || description.trim().length < 10} onClick={() => gen.mutate()}>
            {gen.isPending ? 'Gerando… (pode levar até 1 min por imagem)' : `Gerar ${count > 1 ? `${count} imagens` : 'imagem'}`}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {noKey && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 p-3 text-sm">
            <span>Configure a chave da API do Gemini para gerar imagens.</span>
            <Button
              size="sm"
              variant="outline"
              icon={<Settings2 className="size-3.5" />}
              onClick={() => {
                onClose();
                navigate('/configuracoes');
              }}
            >
              Abrir Configurações
            </Button>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Projeto (usa o briefing e a marca)" htmlFor="gi-proj">
            <Select id="gi-proj" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Sem projeto</option>
              {projects.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Formato" htmlFor="gi-aspect">
            <Select id="gi-aspect" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as ImageAspectRatio)}>
              {ASPECT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Resolução" htmlFor="gi-size" hint={isPro ? '4K custa mais por imagem.' : 'O modelo Flash gera em ~1K; escolha o Pro para 2K/4K.'}>
            <Select id="gi-size" value={imageSize} disabled={!isPro} onChange={(e) => setImageSize(e.target.value as '1K' | '2K' | '4K')}>
              <option value="1K">1K</option>
              <option value="2K">2K (recomendado)</option>
              <option value="4K">4K</option>
            </Select>
          </Field>
          <Field label="Quantidade de variações" htmlFor="gi-count">
            <Select id="gi-count" value={String(count)} onChange={(e) => setCount(Number(e.target.value))}>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Descreva a imagem" htmlFor="gi-desc" hint="Produto, cena, pessoas, estilo (foto realista, 3D, flat), cores, iluminação e o que deve chamar a atenção.">
          <Textarea
            id="gi-desc"
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: Foto realista de uma antena Starlink no telhado de uma casa de fazenda ao pôr do sol, família feliz usando notebook na varanda, luz dourada, sensação de conexão rápida."
          />
        </Field>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useBrief} disabled={!projectId} onChange={(e) => setUseBrief(e.target.checked)} />
            Usar briefing do projeto (público, tom e marca)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={withText} onChange={(e) => setWithText(e.target.checked)} />
            Incluir texto/chamada na imagem
          </label>
        </div>
        {images.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-xs font-medium text-muted">Imagens de referência (opcional, até 3 — produto, logo, estilo)</legend>
            <div className="grid max-h-44 grid-cols-4 gap-2 overflow-y-auto md:grid-cols-6">
              {images.slice(0, 60).map((a) => {
                const on = refs.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={on}
                    title={a.fileName}
                    disabled={!on && refs.length >= 3}
                    onClick={() => setRefs(on ? refs.filter((x) => x !== a.id) : [...refs, a.id])}
                    className={`overflow-hidden rounded-lg border-2 disabled:opacity-40 ${on ? 'border-[#8b6cff]' : 'border-transparent'}`}
                  >
                    <AssetThumb asset={a} className="h-16" />
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
        {gen.data && (
          <div className="flex flex-col gap-2">
            {gen.data.failed > 0 && <p className="text-sm text-warning">{gen.data.failed} variação(ões) falharam.</p>}
            {gen.data.notes.map((n, i) => (
              <p key={i} className="text-xs text-subtle">
                {n}
              </p>
            ))}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {gen.data.assets.map((a) => (
                <Card key={a.id} className="overflow-hidden">
                  <AssetThumb asset={a} className="h-40 object-contain" />
                  <p className="truncate p-2 text-xs text-subtle">{a.width && a.height ? `${a.width}×${a.height}` : a.fileName}</p>
                </Card>
              ))}
            </div>
            <p className="text-xs text-subtle">As imagens já estão na biblioteca (tag #ia-gemini) e podem ser vinculadas aos criativos ou enviadas às contas de anúncios.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function UploadToPlatformModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const organizationId = useOrgId();
  const toast = useToast();
  const integrations = useQuery({ queryKey: ['integrations', organizationId], queryFn: () => api('integration.list', { organizationId }) });
  const accounts = (integrations.data ?? []).flatMap((i) => i.accounts);
  const [accountId, setAccountId] = useState('');
  const upload = useMutation({
    mutationFn: () => api('asset.uploadToPlatform', { organizationId, id: asset.id, accountId }),
    onSuccess: (r) => {
      toast.success(`Imagem enviada. Identificador na plataforma: ${r.remoteId}`);
      onClose();
    },
    onError: (e) => toast.error(e),
  });
  return (
    <Modal
      open
      onClose={onClose}
      title="Enviar imagem para a conta de anúncios"
      description={`"${asset.fileName}" ficará disponível na biblioteca de mídia da conta escolhida.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button icon={<UploadCloud className="size-4" />} loading={upload.isPending} disabled={!accountId} onClick={() => upload.mutate()}>
            Enviar
          </Button>
        </>
      }
    >
      <Field label="Conta de anúncios" htmlFor="up-account" hint={accounts.length === 0 ? 'Nenhuma conta sincronizada. Conecte e sincronize em Integrações.' : 'Enviar a mesma imagem de novo para a mesma conta não cria duplicata.'}>
        <Select id="up-account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          <option value="">Selecione…</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {PLATFORM_LABEL[a.platform]} · {a.name} ({a.remoteId})
            </option>
          ))}
        </Select>
      </Field>
    </Modal>
  );
}
