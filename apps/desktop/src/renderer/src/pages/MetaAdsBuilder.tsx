import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Layers, Pencil, Plus, Send, Trash2, X } from 'lucide-react';
import { META_GOALS_BY_OBJECTIVE, MetaConversionEvent, MetaCta, type Asset, type Campaign, type MetaAdSet, type MetaOptimizationGoal } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Notice, Select, useToast } from '../components/ui';
import { AssetThumb } from './Creatives';

const GOAL_LABEL: Record<MetaOptimizationGoal, string> = {
  OFFSITE_CONVERSIONS: 'Conversões no site (precisa de pixel)',
  LANDING_PAGE_VIEWS: 'Visualizações da página de destino',
  LINK_CLICKS: 'Cliques no link',
  REACH: 'Alcance',
  IMPRESSIONS: 'Impressões',
  POST_ENGAGEMENT: 'Engajamento',
};
const CTA_LABEL: Record<string, string> = {
  SHOP_NOW: 'Comprar agora',
  LEARN_MORE: 'Saiba mais',
  SIGN_UP: 'Cadastre-se',
  BUY_NOW: 'Comprar',
  ORDER_NOW: 'Peça agora',
  GET_OFFER: 'Obter oferta',
  SUBSCRIBE: 'Assinar',
  CONTACT_US: 'Fale conosco',
  APPLY_NOW: 'Candidate-se',
  GET_QUOTE: 'Solicitar orçamento',
  BOOK_NOW: 'Reservar',
  DOWNLOAD: 'Baixar',
};
const EVENT_LABEL: Record<string, string> = {
  PURCHASE: 'Compra',
  LEAD: 'Lead',
  COMPLETE_REGISTRATION: 'Cadastro concluído',
  ADD_TO_CART: 'Adicionar ao carrinho',
  INITIATE_CHECKOUT: 'Início de checkout',
  CONTACT: 'Contato',
  SUBSCRIBE: 'Assinatura',
};
const STATUS_LABEL = { local: 'Rascunho', image: 'Imagem enviada', creative: 'Criativo criado', published: 'Na Meta (pausado)' } as const;

/** Conjuntos de anúncios e anúncios de uma campanha da Meta. */
export function MetaAdSetsModal({ campaign, onClose, openId }: { campaign: Campaign; onClose: () => void; openId?: string | null }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<MetaAdSet | 'new' | null>(null);
  const [pushing, setPushing] = useState<MetaAdSet | null>(null);
  const [deleting, setDeleting] = useState<MetaAdSet | null>(null);
  const sets = useQuery({ queryKey: ['meta-adsets', campaign.id], queryFn: () => api('meta.adSets', { organizationId, campaignId: campaign.id }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['meta-adsets', campaign.id] });

  useEffect(() => {
    if (openId && sets.data) {
      const s = sets.data.find((x) => x.id === openId);
      if (s) setEditing(s);
    }
  }, [openId, sets.data]);

  const push = useMutation({
    mutationFn: (id: string) => api('meta.pushAdSet', { organizationId, id, confirm: true }),
    onSuccess: async () => {
      setPushing(null);
      toast.success('Conjunto e anúncios criados na Meta (pausados). Ative a campanha quando quiser veicular.');
      await refresh();
    },
    onError: async (e) => {
      setPushing(null);
      toast.error(e);
      await refresh();
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => api('meta.deleteAdSet', { organizationId, id }),
    onSuccess: async () => {
      setDeleting(null);
      await refresh();
    },
    onError: (e) => toast.error(e),
  });

  return (
    <Modal open onClose={onClose} size="xl" title={`Conjuntos e anúncios — ${campaign.name}`} description="Público, otimização e anúncios (imagem + texto + título + botão). Tudo é criado pausado na Meta.">
      <div className="flex flex-col gap-3">
        {!campaign.remoteId && <Notice tone="info">A campanha ainda é um rascunho local. Monte os conjuntos agora; o envio fica disponível depois de publicar a campanha.</Notice>}
        {sets.isLoading && <LoadingState rows={2} />}
        {sets.error && <ErrorState error={sets.error} />}
        {sets.data?.length === 0 && (
          <EmptyState icon={<Layers className="size-5" />} title="Nenhum conjunto de anúncios" description="Crie um conjunto e escolha os criativos — ou use o botão “Publicar na Meta” da Fábrica de criativos." />
        )}
        {sets.data?.map((s) => (
          <div key={s.id} className="rounded-lg border border-border bg-surface-2 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {s.name}
                  <Badge tone={s.syncState === 'synced' ? 'success' : s.syncState === 'error' ? 'danger' : s.syncState === 'pending' ? 'warning' : 'neutral'}>
                    {s.syncState === 'synced' ? 'Na Meta (pausado)' : s.syncState === 'error' ? 'Erro no envio' : s.syncState === 'pending' ? 'Resultado incerto' : 'Rascunho local'}
                  </Badge>
                </p>
                <p className="text-xs text-subtle">
                  {s.ads.length} anúncio(s) · {GOAL_LABEL[s.optimizationGoal]} · {s.countries.join(', ')} · {s.advantageAudience ? 'Público Advantage+' : `${s.ageMin}–${s.ageMax} anos`}
                  {s.remoteId && ` · ID ${s.remoteId}`}
                </p>
                {s.missing.length > 0 && <p className="text-xs text-warning">Falta: {s.missing.join('; ')}</p>}
                {s.lastError && <p className="selectable mt-1 text-xs text-danger">{s.lastError}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} onClick={() => setEditing(s)}>
                  {s.remoteId ? 'Anúncios' : 'Editar'}
                </Button>
                {s.syncState !== 'synced' && campaign.remoteId && (
                  <Button size="sm" icon={<Send className="size-3.5" />} disabled={s.missing.length > 0} onClick={() => setPushing(s)}>
                    {s.remoteId ? 'Continuar envio' : 'Enviar à Meta'}
                  </Button>
                )}
                {s.syncState === 'synced' && s.ads.some((a) => a.status !== 'published') && (
                  <Button size="sm" icon={<Send className="size-3.5" />} onClick={() => setPushing(s)}>
                    Enviar anúncios novos
                  </Button>
                )}
                {!s.remoteId && <Button size="sm" variant="ghost" aria-label={`Excluir ${s.name}`} icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(s)} />}
              </div>
            </div>
          </div>
        ))}
        <Button className="self-start" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
          Novo conjunto de anúncios
        </Button>
      </div>
      {editing && <AdSetEditor campaign={campaign} set={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={!!pushing}
        title="Enviar à Meta?"
        confirmLabel="Enviar"
        message={`Serão criados na Meta, PAUSADOS: o conjunto "${pushing?.name}" e ${pushing?.ads.filter((a) => a.status !== 'published').length} anúncio(s) com imagem, texto, título e botão. Nada é veiculado até você ativar a campanha.`}
        loading={push.isPending}
        onConfirm={() => pushing && push.mutate(pushing.id)}
        onClose={() => setPushing(null)}
      />
      <ConfirmDialog
        open={!!deleting}
        danger
        title="Excluir conjunto (rascunho)?"
        confirmLabel="Excluir"
        message="O rascunho do conjunto e dos anúncios será excluído deste computador."
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </Modal>
  );
}

interface AdRow {
  id?: string;
  creativeId: string;
  assetId: string | null;
  headline: string;
  description: string;
  locked: boolean;
}

function AdSetEditor({ campaign, set, onClose }: { campaign: Campaign; set: MetaAdSet | null; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const locked = !!set?.remoteId;
  const goals = META_GOALS_BY_OBJECTIVE[campaign.objective] ?? ['LANDING_PAGE_VIEWS'];
  const options = useQuery({ queryKey: ['meta-options', campaign.id], queryFn: () => api('meta.assetsOptions', { organizationId, campaignId: campaign.id }), enabled: !!campaign.remoteId });
  const creatives = useQuery({ queryKey: ['creatives', organizationId, 'meta-picker'], queryFn: () => api('creative.list', { organizationId, projectId: null, search: '', status: null, tag: '' }) });
  const assets = useQuery({ queryKey: ['assets', organizationId, ''], queryFn: () => api('asset.list', { organizationId, projectId: null, search: '' }) });
  const images = useMemo(() => (assets.data ?? []).filter((a) => a.mimeType.startsWith('image/')), [assets.data]);
  const usable = (creatives.data ?? []).filter((c) => c.kind === 'meta_primary_text' || c.kind === 'generic');

  const [name, setName] = useState(set?.name ?? `${campaign.name} · Conjunto 1`);
  const [goal, setGoal] = useState<MetaOptimizationGoal>(set?.optimizationGoal ?? (goals.includes('LANDING_PAGE_VIEWS') ? 'LANDING_PAGE_VIEWS' : goals[0]!));
  const [pixelId, setPixelId] = useState(set?.pixelId ?? '');
  const [event, setEvent] = useState(set?.conversionEvent ?? 'PURCHASE');
  const [countries, setCountries] = useState((set?.countries ?? ['BR']).join(', '));
  const [ageMin, setAgeMin] = useState(set?.ageMin ?? 18);
  const [ageMax, setAgeMax] = useState(set?.ageMax ?? 65);
  const [gender, setGender] = useState<'all' | 'male' | 'female'>(set?.gender ?? 'all');
  const [advantage, setAdvantage] = useState(set?.advantageAudience ?? true);
  const [budget, setBudget] = useState(set?.dailyBudget?.toString() ?? '');
  const [pageId, setPageId] = useState(set?.pageId ?? '');
  const [igId, setIgId] = useState(set?.instagramUserId ?? '');
  const [link, setLink] = useState(set?.link ?? '');
  const [cta, setCta] = useState(set?.cta ?? 'SHOP_NOW');
  const [ads, setAds] = useState<AdRow[]>(
    set?.ads.map((a) => ({ id: a.id, creativeId: a.creativeId ?? '', assetId: a.assetId, headline: a.headline, description: a.description, locked: a.status !== 'local' && a.status !== 'image' })) ?? [],
  );

  const save = useMutation({
    mutationFn: () =>
      api('meta.saveAdSet', {
        organizationId,
        campaignId: campaign.id,
        id: set?.id ?? null,
        data: {
          name,
          optimizationGoal: goal,
          pixelId: pixelId.trim() || null,
          conversionEvent: event,
          countries: countries.split(/[,\s]+/).map((c) => c.trim().toUpperCase()).filter(Boolean),
          ageMin,
          ageMax,
          gender,
          advantageAudience: advantage,
          dailyBudget: budget.trim() ? Number(budget.replace(',', '.')) : null,
          pageId: pageId.trim() || null,
          instagramUserId: igId.trim() || null,
          link: link.trim(),
          cta,
          ads: ads.filter((a) => a.creativeId).map(({ locked: _l, ...a }) => a),
        },
      }),
    onSuccess: async (s) => {
      toast.success(s.missing.length ? `Rascunho salvo. Falta: ${s.missing.join('; ')}.` : 'Conjunto salvo e pronto para enviar.');
      await qc.invalidateQueries({ queryKey: ['meta-adsets', campaign.id] });
      onClose();
    },
    onError: (e) => toast.error(e),
  });

  const setAd = (i: number, patch: Partial<AdRow>) => setAds((list) => list.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  const addAd = () => setAds((list) => [...list, { creativeId: '', assetId: null, headline: '', description: '', locked: false }]);
  const imagesFor = (creativeId: string): Asset[] => {
    const cr = usable.find((c) => c.id === creativeId);
    const own = images.filter((a) => cr?.assetIds.includes(a.id));
    return own.length ? own : images;
  };

  return (
    <Modal
      open
      size="xl"
      onClose={onClose}
      title={set ? `Conjunto: ${set.name}` : 'Novo conjunto de anúncios'}
      description="Posicionamentos automáticos (Advantage+). Público, otimização e link ficam fixos depois do envio."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            Salvar rascunho local
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {options.data?.notes.map((n, i) => (
          <Notice key={i} tone="warning">
            {n}
          </Notice>
        ))}
        <fieldset disabled={locked} className="grid gap-4 md:grid-cols-3">
          <Field label="Nome do conjunto" htmlFor="ms-name" className="md:col-span-2">
            <Input id="ms-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Otimizar para" htmlFor="ms-goal">
            <Select id="ms-goal" value={goal} onChange={(e) => setGoal(e.target.value as MetaOptimizationGoal)}>
              {goals.map((g) => (
                <option key={g} value={g}>
                  {GOAL_LABEL[g]}
                </option>
              ))}
            </Select>
          </Field>
          {goal === 'OFFSITE_CONVERSIONS' && (
            <>
              <Field label="Pixel" htmlFor="ms-pixel">
                {options.data?.pixels.length ? (
                  <Select id="ms-pixel" value={pixelId} onChange={(e) => setPixelId(e.target.value)}>
                    <option value="">Selecione</option>
                    {options.data.pixels.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id})
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input id="ms-pixel" value={pixelId} onChange={(e) => setPixelId(e.target.value)} placeholder="ID do pixel" />
                )}
              </Field>
              <Field label="Evento de conversão" htmlFor="ms-event">
                <Select id="ms-event" value={event} onChange={(e) => setEvent(e.target.value as typeof event)}>
                  {MetaConversionEvent.options.map((ev) => (
                    <option key={ev} value={ev}>
                      {EVENT_LABEL[ev]}
                    </option>
                  ))}
                </Select>
              </Field>
            </>
          )}
          <Field label="Países" htmlFor="ms-countries" hint="Códigos de 2 letras, separados por vírgula.">
            <Input id="ms-countries" value={countries} onChange={(e) => setCountries(e.target.value)} />
          </Field>
          <Field label="Idade" htmlFor="ms-age">
            <div className="flex items-center gap-2">
              <Input id="ms-age" type="number" min={18} max={65} value={ageMin} onChange={(e) => setAgeMin(Number(e.target.value))} aria-label="Idade mínima" />
              <span className="text-subtle">a</span>
              <Input type="number" min={18} max={65} value={ageMax} onChange={(e) => setAgeMax(Number(e.target.value))} aria-label="Idade máxima" disabled={advantage || locked} />
            </div>
          </Field>
          <Field label="Gênero" htmlFor="ms-gender">
            <Select id="ms-gender" value={gender} onChange={(e) => setGender(e.target.value as typeof gender)}>
              <option value="all">Todos</option>
              <option value="female">Mulheres</option>
              <option value="male">Homens</option>
            </Select>
          </Field>
          <label className="flex items-start gap-2 text-sm md:col-span-3">
            <input type="checkbox" className="mt-1" checked={advantage} onChange={(e) => setAdvantage(e.target.checked)} />
            <span>
              Público Advantage+ (recomendado pela Meta)
              <span className="block text-xs text-subtle">A IA da Meta expande o público; idade e gênero viram sugestões (idade mínima até 25 como controle).</span>
            </span>
          </label>
          {!campaign.dailyBudget && (
            <Field label={`Orçamento diário do conjunto (${campaign.currency})`} htmlFor="ms-budget" hint="A campanha não tem orçamento próprio.">
              <Input id="ms-budget" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </Field>
          )}
          <Field label="Página do Facebook" htmlFor="ms-page">
            {options.data?.pages.length ? (
              <Select id="ms-page" value={pageId} onChange={(e) => setPageId(e.target.value)}>
                <option value="">Selecione</option>
                {options.data.pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            ) : (
              <Input id="ms-page" value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="ID da página" />
            )}
          </Field>
          <Field label="Instagram (opcional)" htmlFor="ms-ig">
            {options.data?.instagram.length ? (
              <Select id="ms-ig" value={igId} onChange={(e) => setIgId(e.target.value)}>
                <option value="">Usar a página</option>
                {options.data.instagram.map((p) => (
                  <option key={p.id} value={p.id}>
                    @{p.username}
                  </option>
                ))}
              </Select>
            ) : (
              <Input id="ms-ig" value={igId} onChange={(e) => setIgId(e.target.value)} placeholder="ID da conta do Instagram" />
            )}
          </Field>
          <Field label="Botão" htmlFor="ms-cta">
            <Select id="ms-cta" value={cta} onChange={(e) => setCta(e.target.value as typeof cta)}>
              {MetaCta.options.map((c) => (
                <option key={c} value={c}>
                  {CTA_LABEL[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Link de destino" htmlFor="ms-link" className="md:col-span-3">
            <Input id="ms-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://sualoja.com.br/produto?utm_source=meta" />
          </Field>
        </fieldset>

        <div>
          <p className="mb-2 text-sm font-medium">Anúncios ({ads.length})</p>
          <div className="flex flex-col gap-3">
            {ads.map((a, i) => {
              const cr = usable.find((c) => c.id === a.creativeId);
              return (
                <div key={a.id ?? `new-${i}`} className="grid gap-3 rounded-lg border border-border bg-surface-2 p-3 md:grid-cols-[1fr_1fr_auto]">
                  <div className="flex flex-col gap-2">
                    <Select aria-label={`Criativo do anúncio ${i + 1}`} value={a.creativeId} disabled={a.locked} onChange={(e) => setAd(i, { creativeId: e.target.value, assetId: null })}>
                      <option value="">Escolha o texto (criativo)</option>
                      {usable.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </Select>
                    {cr && <p className="selectable line-clamp-3 text-xs text-muted">{cr.body}</p>}
                    <Input aria-label={`Título do anúncio ${i + 1}`} maxLength={40} disabled={a.locked} value={a.headline} onChange={(e) => setAd(i, { headline: e.target.value })} placeholder="Título (até 40)" />
                    <Input aria-label={`Descrição do anúncio ${i + 1}`} maxLength={30} disabled={a.locked} value={a.description} onChange={(e) => setAd(i, { description: e.target.value })} placeholder="Descrição (opcional, até 30)" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-muted">Imagem</p>
                    <div className="grid max-h-36 grid-cols-4 gap-1 overflow-y-auto">
                      {imagesFor(a.creativeId).slice(0, 40).map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          disabled={a.locked}
                          aria-pressed={a.assetId === img.id}
                          title={img.fileName}
                          onClick={() => setAd(i, { assetId: img.id })}
                          className={`overflow-hidden rounded border-2 ${a.assetId === img.id ? 'border-[#8b6cff]' : 'border-transparent'}`}
                        >
                          <AssetThumb asset={img} className="h-14" />
                        </button>
                      ))}
                      {images.length === 0 && <p className="col-span-4 text-xs text-subtle">Sem imagens na biblioteca.</p>}
                    </div>
                  </div>
                  <div className="flex items-start">
                    {a.locked ? (
                      <Badge tone="success">{STATUS_LABEL[set?.ads.find((x) => x.id === a.id)?.status ?? 'published']}</Badge>
                    ) : (
                      <Button size="sm" variant="ghost" aria-label={`Remover anúncio ${i + 1}`} icon={<X className="size-3.5" />} onClick={() => setAds((l) => l.filter((_, j) => j !== i))} />
                    )}
                  </div>
                </div>
              );
            })}
            <Button size="sm" variant="outline" className="self-start" icon={<Plus className="size-3.5" />} onClick={addAd}>
              Adicionar anúncio
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
