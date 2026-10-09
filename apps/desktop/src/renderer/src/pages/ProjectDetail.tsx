import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { ArrowLeft, Globe, History, Pencil, RotateCcw, Save, Sparkles } from 'lucide-react';
import { BriefData, formatDateTime, type Brief, type BriefVersion, type PageAnalysis, type Project } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { Badge, Button, Card, CardHeader, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Notice, PageHeader, Tabs, Textarea, useToast } from '../components/ui';
import { ProjectFormModal } from './Projects';

type Tab = 'brief' | 'insights' | 'history';

export function ProjectDetailPage() {
  const { id = '' } = useParams();
  const organizationId = useOrgId();
  const [tab, setTab] = useState<Tab>('brief');
  const [editing, setEditing] = useState(false);
  const project = useQuery({ queryKey: ['project', organizationId, id], queryFn: () => api('project.get', { organizationId, id }) });
  const brief = useQuery({ queryKey: ['brief', organizationId, id], queryFn: () => api('brief.get', { organizationId, projectId: id }) });

  if (project.isLoading || brief.isLoading) return <LoadingState rows={6} />;
  if (project.error) return <ErrorState error={project.error} />;
  if (brief.error) return <ErrorState error={brief.error} onRetry={() => void brief.refetch()} />;
  const p = project.data!;

  return (
    <>
      <Link to="/projetos" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Projetos
      </Link>
      <PageHeader
        title={p.name}
        description={
          <>
            {p.clientName && <>Cliente: {p.clientName} · </>}
            {p.objective || 'Sem objetivo definido'}
          </>
        }
        actions={
          <>
            {brief.data && <Badge tone="brand">Briefing v{brief.data.currentVersion}</Badge>}
            <Button variant="outline" icon={<Pencil className="size-4" />} onClick={() => setEditing(true)}>
              Editar projeto
            </Button>
            <Link to={`/estudio?projeto=${p.id}`}>
              <Button icon={<Sparkles className="size-4" />}>Criar com IA</Button>
            </Link>
          </>
        }
      />
      <div className="mb-5">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'brief', label: 'Briefing' },
            { value: 'insights', label: 'Análise estratégica' },
            { value: 'history', label: 'Histórico de versões' },
          ]}
        />
      </div>
      {tab === 'brief' && <BriefEditor project={p} brief={brief.data ?? null} />}
      {tab === 'insights' && <InsightsPanel project={p} brief={brief.data ?? null} />}
      {tab === 'history' && <HistoryPanel project={p} />}
      {editing && <ProjectFormModal project={p} onClose={() => setEditing(false)} />}
    </>
  );
}

type FormIn = z.input<typeof BriefData>;
type FormOut = z.output<typeof BriefData>;

const SECTIONS: Array<{ title: string; description: string; fields: Array<{ key: keyof FormIn; label: string; textarea?: boolean; placeholder?: string; required?: boolean; hint?: string }> }> = [
  {
    title: 'Negócio e oferta',
    description: 'O que é vendido, para onde e em qual idioma.',
    fields: [
      { key: 'productOrService', label: 'Produto ou serviço', textarea: true, required: true, placeholder: 'Descreva o que será anunciado' },
      { key: 'segment', label: 'Segmento', placeholder: 'Ex.: Educação, Varejo de moda, SaaS B2B' },
      { key: 'offer', label: 'Oferta', textarea: true, placeholder: 'Condição comercial, bônus, garantia real' },
      { key: 'region', label: 'Região', placeholder: 'Ex.: São Paulo capital, Brasil inteiro' },
      { key: 'language', label: 'Idioma', placeholder: 'pt-BR' },
      { key: 'websiteUrl', label: 'Site ou página de destino', placeholder: 'https://', hint: 'Usado na análise de página pública (opcional).' },
    ],
  },
  {
    title: 'Público e posicionamento',
    description: 'Quem compra, por que escolhe você e o que impede a compra.',
    fields: [
      { key: 'targetAudience', label: 'Público-alvo', textarea: true },
      { key: 'differentiators', label: 'Diferenciais', textarea: true },
      { key: 'objections', label: 'Objeções', textarea: true },
      { key: 'toneOfVoice', label: 'Tom de voz', placeholder: 'Ex.: próximo, técnico, bem-humorado' },
    ],
  },
  {
    title: 'Objetivos e métricas',
    description: 'Como o sucesso será medido.',
    fields: [
      { key: 'objectives', label: 'Objetivos', textarea: true },
      { key: 'kpis', label: 'KPIs', placeholder: 'Ex.: CPA até R$ 40, ROAS 3x' },
      { key: 'budget', label: 'Orçamento', placeholder: 'Ex.: R$ 10.000/mês' },
    ],
  },
  {
    title: 'Contexto',
    description: 'Concorrência, restrições legais/de marca e observações.',
    fields: [
      { key: 'competitors', label: 'Concorrentes', textarea: true },
      { key: 'restrictions', label: 'Restrições', textarea: true, placeholder: 'Ex.: não citar preço, exigências regulatórias' },
      { key: 'additionalNotes', label: 'Observações', textarea: true },
    ],
  },
];

const EMPTY: FormIn = { productOrService: '', segment: '', offer: '', region: '', language: 'pt-BR', targetAudience: '', differentiators: '', objections: '', toneOfVoice: '', objectives: '', kpis: '', budget: '', competitors: '', restrictions: '', websiteUrl: '', additionalNotes: '' };

function BriefEditor({ project, brief }: { project: Project; brief: Brief | null }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [note, setNote] = useState('');
  const [analysis, setAnalysis] = useState<PageAnalysis | null>(null);
  const form = useForm<FormIn, unknown, FormOut>({ resolver: zodResolver(BriefData), defaultValues: brief?.data ?? EMPTY });
  const { errors, isDirty } = form.formState;

  useEffect(() => {
    form.reset(brief?.data ?? EMPTY);
  }, [brief, form]);

  const save = useMutation({
    mutationFn: (data: FormOut) => api('brief.save', { organizationId, projectId: project.id, data, note }),
    onSuccess: async (b) => {
      setNote('');
      toast.success(`Briefing salvo (versão ${b.currentVersion}).`);
      qc.setQueryData(['brief', organizationId, project.id], b);
      await qc.invalidateQueries({ queryKey: ['brief-versions'] });
      await qc.invalidateQueries({ queryKey: ['onboarding'] });
    },
    onError: (e) => toast.error(e),
  });

  const analyze = useMutation({
    mutationFn: (url: string) => api('brief.analyzeUrl', { organizationId, url }),
    onSuccess: setAnalysis,
    onError: (e) => toast.error(e),
  });

  const website = form.watch('websiteUrl');

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit((d) => save.mutate(d))}>
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <CardHeader title={s.title} description={s.description} />
            <div className="grid gap-4 p-5 md:grid-cols-2">
              {s.fields.map((f) => {
                const err = errors[f.key]?.message;
                return (
                  <Field key={f.key} label={f.label} htmlFor={`b-${f.key}`} required={f.required} error={err} hint={f.hint} className={f.textarea ? 'md:col-span-2' : ''}>
                    {f.textarea ? (
                      <Textarea id={`b-${f.key}`} aria-invalid={!!err} placeholder={f.placeholder} {...form.register(f.key)} />
                    ) : (
                      <Input id={`b-${f.key}`} aria-invalid={!!err} placeholder={f.placeholder} {...form.register(f.key)} />
                    )}
                  </Field>
                );
              })}
            </div>
          </Card>
        ))}
        <Card className="sticky bottom-4 flex items-end gap-3 border-border-strong p-4 shadow-2xl">
          <Field label="Nota desta versão (opcional)" htmlFor="b-note" className="flex-1">
            <Input id="b-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Ex.: ajuste de público após reunião" />
          </Field>
          {isDirty && <span className="pb-2.5 text-xs text-warning">Alterações não salvas</span>}
          <Button type="submit" loading={save.isPending} icon={<Save className="size-4" />}>
            Salvar nova versão
          </Button>
        </Card>
      </form>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader title="Análise de página pública" description="Lê título, descrição e textos de uma página acessível sem login." />
          <div className="flex flex-col gap-3 p-5">
            <Notice tone="info">Somente páginas públicas (http/https). Endereços internos/privados são bloqueados e páginas com login não são acessadas.</Notice>
            <Button
              variant="outline"
              icon={<Globe className="size-4" />}
              loading={analyze.isPending}
              disabled={!website || !!errors.websiteUrl}
              onClick={() => website && analyze.mutate(website)}
            >
              Analisar site do briefing
            </Button>
            {!website && <p className="text-xs text-subtle">Preencha o campo “Site ou página de destino”.</p>}
            {analysis && (
              <div className="selectable flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-3 text-xs">
                <p className="text-subtle">
                  Capturado em {formatDateTime(analysis.fetchedAt)} · HTTP {analysis.status}
                  <br />
                  <span className="break-all">{analysis.finalUrl}</span>
                </p>
                <p>
                  <b className="text-fg">Título:</b> {analysis.title || '—'}
                </p>
                <p>
                  <b className="text-fg">Descrição:</b> {analysis.description || '—'}
                </p>
                {analysis.headings.length > 0 && (
                  <div>
                    <b className="text-fg">Títulos da página:</b>
                    <ul className="ml-4 list-disc text-muted">
                      {analysis.headings.slice(0, 10).map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const cur = form.getValues('additionalNotes') ?? '';
                    const add = `Site (${analysis.finalUrl}): ${analysis.title}. ${analysis.description}`.trim();
                    form.setValue('additionalNotes', cur ? `${cur}\n${add}` : add, { shouldDirty: true });
                  }}
                >
                  Adicionar às observações
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InsightsPanel({ project, brief }: { project: Project; brief: Brief | null }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const ai = useQuery({ queryKey: ['ai-config'], queryFn: () => api('ai.getConfig') });
  const gen = useMutation({
    mutationFn: () => api('brief.generateInsights', { organizationId, projectId: project.id }),
    onSuccess: (b) => {
      qc.setQueryData(['brief', organizationId, project.id], b);
      toast.success('Análise estratégica gerada.');
    },
    onError: (e) => toast.error(e),
  });

  if (!brief) return <EmptyState title="Briefing ainda não salvo" description="Preencha e salve o briefing para gerar a análise estratégica." />;
  const ins = brief.insights;
  return (
    <div className="flex flex-col gap-5">
      {ai.data && !ai.data.hasApiKey && (
        <Notice tone="warning" title="Provedor de IA não configurado">
          Configure sua chave de API em <Link to="/configuracoes" className="text-[#b9a8ff] underline">Configurações → Provedor de IA</Link> para gerar a análise.
        </Notice>
      )}
      <div className="flex items-center gap-3">
        <Button icon={<Sparkles className="size-4" />} loading={gen.isPending} disabled={!ai.data?.hasApiKey} onClick={() => gen.mutate()}>
          {ins ? 'Gerar nova análise' : 'Gerar análise com IA'}
        </Button>
        {brief.insightsGeneratedAt && (
          <span className="text-xs text-subtle">
            Última análise: {formatDateTime(brief.insightsGeneratedAt)} · modelo {brief.insightsModel} · baseada no briefing v{brief.currentVersion}
          </span>
        )}
      </div>
      {gen.isPending && <LoadingState label="Gerando análise…" rows={4} />}
      {ins && !gen.isPending && (
        <div className="selectable grid gap-4 lg:grid-cols-2">
          <Card className="p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#b9a8ff]">Resumo do negócio</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg/90">{ins.businessSummary}</p>
            <h3 className="mt-4 text-sm font-semibold text-[#b9a8ff]">Proposta de valor</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg/90">{ins.valueProposition}</p>
          </Card>
          <ListCard title="Pilares de comunicação" items={ins.communicationPillars} />
          <ListCard title="Hipóteses de campanha" items={ins.campaignHypotheses} />
          <Card className="lg:col-span-2">
            <CardHeader title="Matriz de mensagens" />
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-subtle">
                <tr>
                  <th className="px-5 py-2 font-medium">Público</th>
                  <th className="px-5 py-2 font-medium">Etapa</th>
                  <th className="px-5 py-2 font-medium">Mensagem</th>
                </tr>
              </thead>
              <tbody>
                {ins.messageMatrix.map((m, i) => (
                  <tr key={i} className="border-t border-border align-top">
                    <td className="px-5 py-2.5">{m.audience}</td>
                    <td className="px-5 py-2.5 text-muted">{m.stage}</td>
                    <td className="px-5 py-2.5">{m.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <ListCard title="Informações ausentes" items={ins.missingInformation} tone="warning" />
        </div>
      )}
      {!ins && !gen.isPending && <EmptyState icon={<Sparkles className="size-5" />} title="Nenhuma análise gerada" description="A IA lê o briefing (e o site, se informado) e propõe pilares, hipóteses e a matriz de mensagens." />}
    </div>
  );
}

function ListCard({ title, items, tone }: { title: string; items: string[]; tone?: 'warning' }) {
  return (
    <Card className="p-5">
      <h3 className={`text-sm font-semibold ${tone === 'warning' ? 'text-warning' : 'text-[#b9a8ff]'}`}>{title}</h3>
      <ul className="mt-3 flex flex-col gap-2 text-sm text-fg/90">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
            {it}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function HistoryPanel({ project }: { project: Project }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [viewing, setViewing] = useState<BriefVersion | null>(null);
  const [restoring, setRestoring] = useState<BriefVersion | null>(null);
  const versions = useQuery({ queryKey: ['brief-versions', organizationId, project.id], queryFn: () => api('brief.versions', { organizationId, projectId: project.id }) });
  const restore = useMutation({
    mutationFn: (v: BriefVersion) => api('brief.restore', { organizationId, projectId: project.id, versionId: v.id }),
    onSuccess: async (b) => {
      setRestoring(null);
      qc.setQueryData(['brief', organizationId, project.id], b);
      await qc.invalidateQueries({ queryKey: ['brief-versions'] });
      toast.success(`Versão restaurada como v${b.currentVersion}.`);
    },
    onError: (e) => toast.error(e),
  });

  if (versions.isLoading) return <LoadingState />;
  if (versions.error) return <ErrorState error={versions.error} />;
  if (!versions.data?.length) return <EmptyState icon={<History className="size-5" />} title="Sem versões" description="Cada vez que você salva o briefing, uma nova versão imutável é registrada aqui." />;

  return (
    <Card>
      <ul>
        {versions.data.map((v, i) => (
          <li key={v.id} className="flex items-center gap-4 border-b border-border px-5 py-3 last:border-0">
            <Badge tone={i === 0 ? 'brand' : 'neutral'}>v{v.version}</Badge>
            <div className="flex-1">
              <p className="text-sm">{v.note || <span className="text-subtle">Sem nota</span>}</p>
              <p className="text-xs text-subtle">{formatDateTime(v.createdAt)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setViewing(v)}>
              Visualizar
            </Button>
            {i > 0 && (
              <Button variant="outline" size="sm" icon={<RotateCcw className="size-3.5" />} onClick={() => setRestoring(v)}>
                Restaurar
              </Button>
            )}
          </li>
        ))}
      </ul>
      {viewing && (
        <Modal open onClose={() => setViewing(null)} title={`Briefing — versão ${viewing.version}`} size="lg">
          <dl className="selectable grid gap-3 text-sm">
            {SECTIONS.flatMap((s) => s.fields).map((f) => (
              <div key={f.key} className="grid grid-cols-[180px_1fr] gap-3">
                <dt className="text-subtle">{f.label}</dt>
                <dd className="whitespace-pre-wrap">{String(viewing.data[f.key] ?? '') || '—'}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}
      <ConfirmDialog
        open={!!restoring}
        title="Restaurar versão?"
        message={`O conteúdo da versão ${restoring?.version} será salvo como uma nova versão. Nenhuma versão é apagada.`}
        confirmLabel="Restaurar"
        loading={restore.isPending}
        onConfirm={() => restoring && restore.mutate(restoring)}
        onClose={() => setRestoring(null)}
      />
    </Card>
  );
}
