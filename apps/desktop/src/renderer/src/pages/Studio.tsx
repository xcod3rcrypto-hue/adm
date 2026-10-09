import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Save, Sparkles, Wand2 } from 'lucide-react';
import { CreativeKind, FunnelStage, type StudioResult } from '@advertex/shared';
import { TEXT_RULES, validateText } from '@advertex/advertising-core';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { KIND_LABEL, KIND_PLATFORM, STAGE_LABEL } from '../lib/labels';
import { Badge, Button, Card, CardHeader, EmptyState, Field, Input, LoadingState, Notice, PageHeader, Select, Textarea, useToast } from '../components/ui';

export function StudioPage() {
  const organizationId = useOrgId();
  const [params] = useSearchParams();
  const toast = useToast();
  const [projectId, setProjectId] = useState(params.get('projeto') ?? '');
  const [kind, setKind] = useState<CreativeKind>('meta_primary_text');
  const [stage, setStage] = useState<FunnelStage>('consideration');
  const [audience, setAudience] = useState('');
  const [count, setCount] = useState(5);
  const [instructions, setInstructions] = useState('');
  const [result, setResult] = useState<StudioResult | null>(null);

  const projects = useQuery({ queryKey: ['projects', organizationId, false], queryFn: () => api('project.list', { organizationId, includeArchived: false }) });
  const ai = useQuery({ queryKey: ['ai-config'], queryFn: () => api('ai.getConfig') });
  const brief = useQuery({
    queryKey: ['brief', organizationId, projectId],
    queryFn: () => api('brief.get', { organizationId, projectId }),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (!projectId && projects.data?.[0]) setProjectId(projects.data[0].id);
  }, [projects.data, projectId]);

  const gen = useMutation({
    mutationFn: () => api('studio.generate', { organizationId, request: { projectId, kind, funnelStage: stage, audience, count, instructions } }),
    onSuccess: setResult,
    onError: (e) => toast.error(e),
  });

  const rule = TEXT_RULES[kind];
  const ready = !!projectId && !!brief.data && !!ai.data?.hasApiKey;

  return (
    <>
      <PageHeader title="Estúdio de IA" description="Gere variações de texto a partir do briefing do projeto, revise, edite e salve na biblioteca de criativos." />

      {ai.data && !ai.data.hasApiKey && (
        <div className="mb-5">
          <Notice tone="warning" title="Provedor de IA não configurado">
            A geração usa a API da Anthropic com a sua chave. Configure-a em{' '}
            <Link to="/configuracoes" className="text-[#b9a8ff] underline">
              Configurações → Provedor de IA
            </Link>
            . Enquanto isso, você pode criar criativos manualmente na biblioteca.
          </Notice>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader title="Parâmetros" />
          <form
            className="flex flex-col gap-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              gen.mutate();
            }}
          >
            <Field label="Projeto" htmlFor="s-project" required>
              <Select id="s-project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                {projects.data?.length === 0 && <option value="">Nenhum projeto</option>}
                {projects.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            {projectId && brief.isFetched && !brief.data && (
              <Notice tone="warning">
                Este projeto ainda não tem briefing salvo.{' '}
                <Link to={`/projetos/${projectId}`} className="text-[#b9a8ff] underline">
                  Preencher briefing
                </Link>
              </Notice>
            )}
            <Field label="Formato" htmlFor="s-kind" hint={rule.limit ? `${rule.enforcement === 'hard' ? 'Limite rígido' : 'Recomendado'}: ${rule.limit} caracteres` : 'Sem limite de caracteres'}>
              <Select id="s-kind" value={kind} onChange={(e) => setKind(e.target.value as CreativeKind)}>
                {CreativeKind.options.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Etapa do funil" htmlFor="s-stage">
              <Select id="s-stage" value={stage} onChange={(e) => setStage(e.target.value as FunnelStage)}>
                {FunnelStage.options.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Público específico (opcional)" htmlFor="s-aud">
              <Input id="s-aud" value={audience} onChange={(e) => setAudience(e.target.value)} maxLength={500} placeholder="Ex.: mães de primeira viagem" />
            </Field>
            <Field label={`Quantidade de variações: ${count}`} htmlFor="s-count">
              <input id="s-count" type="range" min={1} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} className="accent-[#7c5cff]" />
            </Field>
            <Field label="Instruções adicionais" htmlFor="s-inst">
              <Textarea id="s-inst" value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={2000} placeholder="Ex.: mencionar frete grátis, evitar emojis" />
            </Field>
            <Button type="submit" loading={gen.isPending} disabled={!ready} icon={<Wand2 className="size-4" />}>
              Gerar variações
            </Button>
          </form>
        </Card>

        <div>
          {gen.isPending && <LoadingState label="Gerando variações…" rows={count > 4 ? 5 : count} />}
          {!gen.isPending && !result && (
            <EmptyState icon={<Sparkles className="size-5" />} title="Nenhuma variação gerada" description="Escolha o projeto e o formato e clique em “Gerar variações”. Nada é publicado automaticamente." />
          )}
          {!gen.isPending && result && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-subtle">
                Modelo: {result.model} · Revise antes de usar: textos gerados por IA podem conter imprecisões.
              </p>
              {result.variations.map((v, i) => (
                <VariationCard key={`${result.jobId}-${i}`} index={i} initial={v.text} rationale={v.rationale} kind={kind} stage={stage} projectId={projectId} jobId={result.jobId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function VariationCard(props: { index: number; initial: string; rationale: string; kind: CreativeKind; stage: FunnelStage; projectId: string; jobId: string }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [text, setText] = useState(props.initial);
  const [saved, setSaved] = useState(false);
  const check = validateText(props.kind, text);

  const save = useMutation({
    mutationFn: () =>
      api('creative.create', {
        organizationId,
        data: {
          projectId: props.projectId,
          title: `${KIND_LABEL[props.kind]} — variação ${props.index + 1}`,
          kind: props.kind,
          platform: KIND_PLATFORM[props.kind],
          funnelStage: props.stage,
          body: text,
          source: 'ai',
          aiJobId: props.jobId,
          tags: ['ia'],
        },
      }),
    onSuccess: async () => {
      setSaved(true);
      toast.success('Salvo na biblioteca de criativos.');
      await qc.invalidateQueries({ queryKey: ['creatives'] });
    },
    onError: (e) => toast.error(e),
  });

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-subtle">Variação {props.index + 1}</span>
        <Badge tone={check.withinLimit ? 'success' : check.enforcement === 'hard' ? 'danger' : 'warning'}>
          {check.count}
          {check.limit ? `/${check.limit}` : ''} caracteres
        </Badge>
      </div>
      <Textarea aria-label={`Texto da variação ${props.index + 1}`} value={text} onChange={(e) => setText(e.target.value)} className="min-h-[60px]" />
      {check.message && <p className="mt-1.5 text-xs text-warning">{check.message}</p>}
      <p className="mt-2 text-xs text-muted">
        <b className="text-fg/80">Lógica:</b> {props.rationale}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={<Copy className="size-3.5" />}
          onClick={() => {
            void navigator.clipboard.writeText(text).then(() => toast.info('Copiado.'));
          }}
        >
          Copiar
        </Button>
        <Button size="sm" variant={saved ? 'secondary' : 'primary'} disabled={saved || !text.trim()} loading={save.isPending} onClick={() => save.mutate()} icon={saved ? <Check className="size-3.5" /> : <Save className="size-3.5" />}>
          {saved ? 'Salvo' : 'Salvar na biblioteca'}
        </Button>
      </div>
    </Card>
  );
}
