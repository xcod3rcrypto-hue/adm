import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Beaker, Factory, Trophy, X } from 'lucide-react';
import { FunnelStage, formatPercent, type FactoryRequest } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { PLATFORM_LABEL, STAGE_LABEL } from '../lib/labels';
import { Badge, Button, Card, CardHeader, Field, Notice, PageHeader, Select, Textarea, useToast } from '../components/ui';
import { AssetThumb } from './Creatives';

type Format = '1:1' | '4:5' | '9:16' | '16:9';
const FORMATS: Array<{ value: Format; label: string }> = [
  { value: '1:1', label: 'Feed 1:1' },
  { value: '4:5', label: 'Feed 4:5' },
  { value: '9:16', label: 'Stories/Reels 9:16' },
  { value: '16:9', label: 'Display 16:9' },
];
// Valores aproximados por imagem (USD), para estimar o custo do lote.
const PRICE: Record<string, number> = { 'gemini-3-pro-image-preview': 0.134, 'gemini-2.5-flash-image': 0.039 };

export function FactoryPage() {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const winnerId = params.get('vencedor');
  const projects = useQuery({ queryKey: ['projects', organizationId, false], queryFn: () => api('project.list', { organizationId, includeArchived: false }) });
  const imageCfg = useQuery({ queryKey: ['image-ai-config'], queryFn: () => api('image.getConfig') });
  const ads = useQuery({ queryKey: ['brain-ads', organizationId], queryFn: () => api('brain.ads', { organizationId, platform: null }), enabled: !!winnerId });
  const winner = ads.data?.find((a) => a.id === winnerId) ?? null;

  const [projectId, setProjectId] = useState('');
  const [kind, setKind] = useState<NonNullable<FactoryRequest['kind']>>('meta_primary_text');
  const [funnelStage, setFunnelStage] = useState<FunnelStage>('conversion');
  const [angles, setAngles] = useState(5);
  const [formats, setFormats] = useState<Format[]>(['1:1', '9:16']);
  const [withImages, setWithImages] = useState(true);
  const [imageSize, setImageSize] = useState<'1K' | '2K'>('2K');
  const [instructions, setInstructions] = useState('');
  const [createExperiment, setCreateExperiment] = useState(true);

  useEffect(() => {
    if (!projectId && projects.data?.[0]) setProjectId(winner?.projectId ?? projects.data[0].id);
  }, [projects.data, projectId, winner]);
  useEffect(() => {
    if (winner) setKind(winner.platform === 'google' ? 'google_rsa_description' : 'meta_primary_text');
  }, [winner]);

  const run = useMutation({
    mutationFn: () =>
      api('factory.run', {
        organizationId,
        request: { projectId, kind, funnelStage, angles, formats, withImages, imageSize, winnerAdId: winner?.id ?? null, instructions, createExperiment },
      }),
    onSuccess: async (r) => {
      toast.success(`${r.creatives.length} conceito(s) e ${r.assets.length} imagem(ns) criados.`);
      await qc.invalidateQueries({ queryKey: ['creatives'] });
      await qc.invalidateQueries({ queryKey: ['assets'] });
      await qc.invalidateQueries({ queryKey: ['experiments'] });
    },
    onError: (e) => toast.error(e),
  });

  const images = withImages ? Math.min(16, angles * formats.length) : 0;
  const price = PRICE[imageCfg.data?.model ?? ''] ?? 0.134;
  const hasKey = imageCfg.data?.hasApiKey ?? false;

  return (
    <>
      <PageHeader
        title="Fábrica de criativos"
        description="Gera uma bateria de teste completa em um clique: ângulos diferentes (ou variações do seu anúncio vencedor), textos, imagens em cada formato e o experimento A/B pronto para comparar."
      />

      {winner && (
        <Card className="mb-6 border-success/40">
          <div className="flex gap-3 p-4">
            <Trophy className="mt-0.5 size-5 shrink-0 text-success" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                Multiplicando o vencedor: {winner.headline || winner.adName} <Badge tone={winner.platform}>{PLATFORM_LABEL[winner.platform]}</Badge>
              </p>
              <p className="selectable mt-1 line-clamp-2 text-xs text-muted">{winner.body}</p>
              <p className="mt-1 text-xs text-subtle">CTR {formatPercent(winner.ctr)} · as variações preservam o que funciona e mudam uma variável por vez.</p>
            </div>
            <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} onClick={() => setParams({})} aria-label="Remover vencedor" />
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Montar lote" description="Os aprendizados do Cérebro criativo e o briefing do projeto orientam a IA automaticamente." />
        <form
          className="grid gap-4 p-5 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            run.mutate();
          }}
        >
          <Field label="Projeto" htmlFor="fx-project">
            <Select id="fx-project" value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
              {projects.data?.length === 0 && <option value="">Crie um projeto primeiro</option>}
              {projects.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Formato do texto" htmlFor="fx-kind">
            <Select id="fx-kind" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
              <option value="meta_primary_text">Meta — texto principal</option>
              <option value="google_rsa_description">Google — descrição (90 caracteres)</option>
              <option value="generic">Texto livre</option>
            </Select>
          </Field>
          <Field label="Etapa do funil" htmlFor="fx-stage">
            <Select id="fx-stage" value={funnelStage} onChange={(e) => setFunnelStage(e.target.value as FunnelStage)}>
              {FunnelStage.options.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={winner ? 'Variações' : 'Ângulos diferentes'} htmlFor="fx-angles">
            <Select id="fx-angles" value={String(angles)} onChange={(e) => setAngles(Number(e.target.value))}>
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </Field>
          <fieldset className="md:col-span-2">
            <legend className="mb-1.5 text-xs font-medium text-muted">Imagens (Gemini)</legend>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={withImages} onChange={(e) => setWithImages(e.target.checked)} />
                Gerar imagens
              </label>
              {FORMATS.map((f) => (
                <label key={f.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={!withImages}
                    checked={formats.includes(f.value)}
                    onChange={(e) => setFormats(e.target.checked ? [...formats, f.value] : formats.filter((x) => x !== f.value))}
                  />
                  {f.label}
                </label>
              ))}
              <Select aria-label="Resolução" value={imageSize} disabled={!withImages} onChange={(e) => setImageSize(e.target.value as '1K' | '2K')} className="w-24">
                <option value="2K">2K</option>
                <option value="1K">1K</option>
              </Select>
            </div>
          </fieldset>
          <Field label="Instruções (opcional)" htmlFor="fx-instr" className="md:col-span-2">
            <Textarea id="fx-instr" rows={2} maxLength={1000} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Ex.: foco em produtores rurais; destacar instalação em 1 dia." />
          </Field>
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={createExperiment} onChange={(e) => setCreateExperiment(e.target.checked)} />
              Criar experimento A/B
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-3">
            <p className="text-xs text-subtle">
              {withImages && hasKey
                ? `${images} imagem(ns) · custo estimado ≈ US$ ${(images * price).toFixed(2)} (cobrado pelo Google). Leva cerca de ${Math.max(1, Math.round((images * 25) / 60))} min.`
                : withImages
                  ? 'Sem chave do Gemini: serão criados só os textos (configure em Configurações para gerar imagens).'
                  : 'Somente textos.'}
            </p>
            <Button type="submit" icon={<Factory className="size-4" />} loading={run.isPending} disabled={!projectId}>
              {run.isPending ? 'Fabricando…' : 'Fabricar lote'}
            </Button>
          </div>
        </form>
      </Card>

      {run.data && (
        <div className="mt-6 flex flex-col gap-4">
          {run.data.notes.length > 0 && (
            <Notice tone="info">
              <ul className="list-disc space-y-1 pl-4">
                {run.data.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </Notice>
          )}
          {run.data.experimentId && (
            <Notice tone="success" title="Experimento A/B criado">
              Os conceitos já estão cadastrados como variantes.{' '}
              <Link to="/experimentos" className="inline-flex items-center gap-1 text-[#b9a8ff] underline">
                <Beaker className="size-3.5" /> Abrir Experimentos
              </Link>
            </Notice>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {run.data.creatives.map((c) => {
              const imgs = run.data.assets.filter((a) => c.assetIds.includes(a.id));
              return (
                <Card key={c.id} className="overflow-hidden">
                  {imgs.length > 0 && (
                    <div className="grid grid-cols-2 gap-0.5 bg-surface-3">
                      {imgs.map((a) => (
                        <AssetThumb key={a.id} asset={a} className="h-36 object-cover" />
                      ))}
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm font-medium">{c.title.replace('Fábrica · ', '')}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {c.tags
                        .filter((t) => t !== 'fabrica' && !t.startsWith('fabrica-'))
                        .map((t) => (
                          <Badge key={t}>#{t}</Badge>
                        ))}
                    </div>
                    <p className="selectable mt-2 whitespace-pre-wrap text-sm text-fg/90">{c.body}</p>
                    {c.cta && <p className="mt-2 text-xs text-subtle">Botão: {c.cta}</p>}
                  </div>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-subtle">Tudo foi salvo em Criativos (rascunho, tag #fabrica) para revisar, aprovar e publicar.</p>
        </div>
      )}
    </>
  );
}
