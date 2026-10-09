import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Globe, Lightbulb, ListPlus, Pencil, Plus, Send, Sparkles, Trash2, Wand2, X } from 'lucide-react';
import { formatNumber, type Campaign, type KeywordIdea, type KeywordIdeasResult, type KeywordMatchType, type SearchAdGroup } from '@advertex/shared';
import { validateText } from '@advertex/advertising-core';
import { api } from '../lib/api';
import { useOrgId } from '../lib/org';
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Notice, Select, Textarea, useToast } from '../components/ui';
import { cn } from '../lib/cn';

const MATCH_LABEL: Record<KeywordMatchType, string> = { BROAD: 'Ampla', PHRASE: 'Frase', EXACT: 'Exata' };
const COMPETITION_LABEL = { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta' } as const;

/** Lista e envio dos grupos de anúncios de uma campanha de Pesquisa do Google. */
export function SearchStructureModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<SearchAdGroup | 'new' | null>(null);
  const [pushing, setPushing] = useState<SearchAdGroup | null>(null);
  const [deleting, setDeleting] = useState<SearchAdGroup | null>(null);
  const groups = useQuery({ queryKey: ['search-groups', campaign.id], queryFn: () => api('search.adGroups', { organizationId, campaignId: campaign.id }) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['search-groups', campaign.id] });
  const push = useMutation({
    mutationFn: (id: string) => api('search.pushAdGroup', { organizationId, id, confirm: true }),
    onSuccess: async () => {
      setPushing(null);
      toast.success('Grupo, palavras-chave e anúncio criados no Google Ads.');
      await refresh();
    },
    onError: async (e) => {
      setPushing(null);
      toast.error(e);
      await refresh();
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => api('search.deleteAdGroup', { organizationId, id }),
    onSuccess: async () => {
      setDeleting(null);
      await refresh();
    },
    onError: (e) => toast.error(e),
  });

  return (
    <Modal open onClose={onClose} size="xl" title={`Anúncios e palavras-chave — ${campaign.name}`} description="Grupos de anúncios da campanha de Pesquisa: palavras-chave, negativas e anúncio responsivo.">
      <div className="flex flex-col gap-3">
        {!campaign.remoteId && (
          <Notice tone="info">A campanha ainda é um rascunho local. Você pode montar os grupos agora; o envio ao Google Ads fica disponível depois de publicar a campanha.</Notice>
        )}
        {groups.isLoading && <LoadingState rows={2} />}
        {groups.error && <ErrorState error={groups.error} />}
        {groups.data?.length === 0 && (
          <EmptyState
            icon={<ListPlus className="size-5" />}
            title="Nenhum grupo de anúncios"
            description="Cole o link da página de destino e deixe a IA montar títulos, descrições e palavras-chave — depois revise e envie."
          />
        )}
        {groups.data?.map((g) => (
          <div key={g.id} className="rounded-lg border border-border bg-surface-2 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium">
                  {g.name}
                  <Badge tone={g.syncState === 'synced' ? 'success' : g.syncState === 'error' ? 'danger' : g.syncState === 'pending' ? 'warning' : 'neutral'}>
                    {g.syncState === 'synced' ? 'No Google Ads' : g.syncState === 'error' ? 'Erro no envio' : g.syncState === 'pending' ? 'Resultado incerto' : 'Rascunho local'}
                  </Badge>
                </p>
                <p className="text-xs text-subtle">
                  {g.keywords.length} palavra(s)-chave · {g.negativeKeywords.length} negativa(s) · {g.ad.headlines.length} títulos · {g.ad.descriptions.length} descrições
                  {g.remoteId && ` · ID ${g.remoteId}`}
                </p>
                {g.syncState !== 'synced' && g.steps.adGroup && (
                  <p className="text-xs text-muted">
                    Etapas: grupo {g.steps.adGroup ? '✓' : '—'} · palavras {g.steps.keywords ? '✓' : '—'} · negativas {g.steps.negatives ? '✓' : '—'} · anúncio {g.steps.ad ? '✓' : '—'}
                  </p>
                )}
                {g.lastError && <p className="mt-1 text-xs text-danger selectable">{g.lastError}</p>}
              </div>
              <div className="flex gap-1">
                {!g.steps.adGroup && (
                  <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} onClick={() => setEditing(g)}>
                    Editar
                  </Button>
                )}
                {g.syncState !== 'synced' && campaign.remoteId && (
                  <Button size="sm" icon={<Send className="size-3.5" />} onClick={() => setPushing(g)}>
                    {g.steps.adGroup ? 'Continuar envio' : 'Enviar ao Google Ads'}
                  </Button>
                )}
                {!g.steps.adGroup && <Button size="sm" variant="ghost" aria-label={`Excluir ${g.name}`} icon={<Trash2 className="size-3.5" />} onClick={() => setDeleting(g)} />}
              </div>
            </div>
          </div>
        ))}
        <Button className="self-start" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
          Novo grupo de anúncios
        </Button>
      </div>
      {editing && <AdGroupEditor campaign={campaign} group={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={!!pushing}
        title="Enviar ao Google Ads?"
        confirmLabel="Enviar"
        message={`Serão criados no Google Ads: o grupo "${pushing?.name}", ${pushing?.keywords.length} palavra(s)-chave, ${pushing?.negativeKeywords.length} negativa(s) e o anúncio responsivo. A campanha continua no status atual (criada pausada) — ative-a em Campanhas quando quiser veicular.`}
        loading={push.isPending}
        onConfirm={() => pushing && push.mutate(pushing.id)}
        onClose={() => setPushing(null)}
      />
      <ConfirmDialog
        open={!!deleting}
        danger
        title="Excluir grupo (rascunho)?"
        confirmLabel="Excluir"
        message="O rascunho do grupo será excluído deste computador."
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </Modal>
  );
}

interface KwRow {
  text: string;
  matchType: KeywordMatchType;
  info?: KeywordIdea;
}

function CharCount({ text, kind }: { text: string; kind: 'google_rsa_headline' | 'google_rsa_description' }) {
  const v = validateText(kind, text);
  return <span className={cn('w-12 shrink-0 text-right text-[11px] tabular-nums', v.withinLimit ? 'text-subtle' : 'font-semibold text-danger')}>{v.count}/{v.limit}</span>;
}

function AdGroupEditor({ campaign, group, onClose }: { campaign: Campaign; group: SearchAdGroup | null; onClose: () => void }) {
  const organizationId = useOrgId();
  const qc = useQueryClient();
  const toast = useToast();
  const [name, setName] = useState(group?.name ?? 'Grupo principal');
  const [cpc, setCpc] = useState(group?.cpcBid ? String(group.cpcBid) : '');
  const [keywords, setKeywords] = useState<KwRow[]>(group?.keywords ?? []);
  const [newKw, setNewKw] = useState('');
  const [negatives, setNegatives] = useState((group?.negativeKeywords ?? []).join('\n'));
  const [finalUrl, setFinalUrl] = useState(group?.ad.finalUrl ?? '');
  const [path1, setPath1] = useState(group?.ad.path1 ?? '');
  const [path2, setPath2] = useState(group?.ad.path2 ?? '');
  const [headlines, setHeadlines] = useState<string[]>(group?.ad.headlines.length ? group.ad.headlines : ['', '', '']);
  const [descriptions, setDescriptions] = useState<string[]>(group?.ad.descriptions.length ? group.ad.descriptions : ['', '']);
  const [seeds, setSeeds] = useState('');
  const [ideas, setIdeas] = useState<KeywordIdeasResult | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [strategy, setStrategy] = useState<{ text: string; notes: string[] } | null>(null);

  const seedList = () => seeds.split(/[,\n]/).map((s) => s.trim()).filter(Boolean).slice(0, 20);

  const fromPage = useMutation({
    mutationFn: () => api('search.adFromPage', { organizationId, campaignId: campaign.id, url: finalUrl, seeds: seedList() }),
    onSuccess: (d) => {
      setFinalUrl(d.finalUrl);
      setPath1(d.path1);
      setPath2(d.path2);
      setHeadlines(d.headlines);
      setDescriptions(d.descriptions);
      setKeywords(d.keywords.map((k) => ({ text: k.text, matchType: k.suggestedMatchType ?? 'PHRASE', info: k })));
      setNegatives(d.negatives.join('\n'));
      setStrategy({ text: d.strategy, notes: d.notes });
      toast.success(`Gerado: ${d.headlines.length} títulos, ${d.descriptions.length} descrições e ${d.keywords.length} palavras-chave. Revise antes de enviar.`);
    },
    onError: (e) => toast.error(e),
  });
  const ideasGoogle = useMutation({
    mutationFn: () => api('search.keywordIdeasGoogle', { organizationId, campaignId: campaign.id, request: { seeds: seedList(), url: finalUrl } }),
    onSuccess: (r) => {
      setIdeas(r);
      setPicked(new Set());
    },
    onError: (e) => toast.error(e),
  });
  const ideasAi = useMutation({
    mutationFn: () => api('search.keywordIdeasAi', { organizationId, campaignId: campaign.id, seeds: seedList() }),
    onSuccess: (r) => {
      setIdeas(r);
      setPicked(new Set());
    },
    onError: (e) => toast.error(e),
  });
  const approved = useMutation({
    mutationFn: () => api('creative.list', { organizationId, projectId: campaign.projectId, status: 'approved' }),
    onSuccess: (list) => {
      const h = list.filter((c) => c.kind === 'google_rsa_headline').map((c) => c.body);
      const d = list.filter((c) => c.kind === 'google_rsa_description').map((c) => c.body);
      if (h.length === 0 && d.length === 0) {
        toast.info('Nenhum criativo aprovado de título/descrição RSA neste projeto.');
        return;
      }
      if (h.length) setHeadlines([...new Set([...headlines.filter(Boolean), ...h])].slice(0, 15));
      if (d.length) setDescriptions([...new Set([...descriptions.filter(Boolean), ...d])].slice(0, 4));
      toast.success(`${h.length} título(s) e ${d.length} descrição(ões) aprovados adicionados.`);
    },
    onError: (e) => toast.error(e),
  });
  const save = useMutation({
    mutationFn: () =>
      api('search.saveAdGroup', {
        organizationId,
        campaignId: campaign.id,
        id: group?.id ?? null,
        data: {
          name,
          cpcBid: cpc ? Number(cpc) : null,
          keywords: keywords.map((k) => ({ text: k.text, matchType: k.matchType })),
          negativeKeywords: negatives.split('\n').map((n) => n.trim()).filter(Boolean),
          ad: { finalUrl, path1, path2, headlines: headlines.map((h) => h.trim()).filter(Boolean), descriptions: descriptions.map((d) => d.trim()).filter(Boolean) },
        },
      }),
    onSuccess: async () => {
      toast.success('Grupo de anúncios salvo.');
      await qc.invalidateQueries({ queryKey: ['search-groups', campaign.id] });
      onClose();
    },
    onError: (e) => toast.error(e),
  });

  const addKeyword = (text: string, matchType: KeywordMatchType = 'PHRASE', info?: KeywordIdea) => {
    const t = text.trim().toLowerCase();
    if (!t || keywords.some((k) => k.text.toLowerCase() === t && k.matchType === matchType)) return;
    setKeywords((list) => [...list, { text: t, matchType, info }]);
  };
  const busy = fromPage.isPending || ideasGoogle.isPending || ideasAi.isPending;
  const previewHeadlines = headlines.filter(Boolean).slice(0, 3).join(' | ');
  const host = (() => {
    try {
      return new URL(finalUrl).hostname.replace(/^www\./, '');
    } catch {
      return 'seusite.com.br';
    }
  })();

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={group ? 'Editar grupo de anúncios' : 'Novo grupo de anúncios'}
      description="Comece pelo link: a IA lê a página e monta tudo. Depois ajuste o que quiser."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={save.isPending} icon={<CheckCircle2 className="size-4" />} onClick={() => save.mutate()}>
            Salvar grupo
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-brand/40 bg-brand-soft/30 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Wand2 className="size-4 text-[#b9a8ff]" /> Gerar a partir do link
          </p>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <Field label="Página de destino (URL final)" htmlFor="sb-url">
              <Input id="sb-url" value={finalUrl} onChange={(e) => setFinalUrl(e.target.value)} placeholder="https://seusite.com.br/produto" />
            </Field>
            <Field label="Palavras-semente (opcional)" htmlFor="sb-seeds" hint="Separe por vírgula.">
              <Input id="sb-seeds" value={seeds} onChange={(e) => setSeeds(e.target.value)} placeholder="ex.: internet rural, starlink" />
            </Field>
            <div className="flex items-start pt-6">
              <Button icon={<Sparkles className="size-4" />} loading={fromPage.isPending} disabled={!/^https?:\/\//.test(finalUrl) || busy} onClick={() => fromPage.mutate()}>
                Gerar com IA a partir do link
              </Button>
            </div>
          </div>
          {strategy && (
            <div className="mt-3 text-xs text-muted">
              <p>
                <span className="font-medium text-fg">Estratégia:</span> {strategy.text}
              </p>
              {strategy.notes.map((n) => (
                <p key={n}>· {n}</p>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <Field label="Nome do grupo de anúncios" htmlFor="sb-name">
            <Input id="sb-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={`Lance máximo de CPC (${campaign.currency}, opcional)`} htmlFor="sb-cpc" hint="Vazio = lance padrão do Google.">
            <Input id="sb-cpc" type="number" min="0" step="0.01" value={cpc} onChange={(e) => setCpc(e.target.value)} />
          </Field>
        </section>

        <section>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">Palavras-chave ({keywords.length})</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" icon={<Globe className="size-3.5" />} loading={ideasGoogle.isPending} disabled={busy} onClick={() => ideasGoogle.mutate()}>
                Ideias do Google
              </Button>
              <Button size="sm" variant="secondary" icon={<Lightbulb className="size-3.5" />} loading={ideasAi.isPending} disabled={busy} onClick={() => ideasAi.mutate()}>
                Ideias com IA
              </Button>
            </div>
          </div>
          <form
            className="mb-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addKeyword(newKw);
              setNewKw('');
            }}
          >
            <Input aria-label="Nova palavra-chave" value={newKw} onChange={(e) => setNewKw(e.target.value)} placeholder="Digite e pressione Enter" />
            <Button type="submit" variant="outline" icon={<Plus className="size-4" />}>
              Adicionar
            </Button>
          </form>
          {keywords.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-surface-2 text-left text-subtle">
                  <tr>
                    <th className="px-2 py-1.5">Palavra-chave</th>
                    <th className="px-2 py-1.5">Correspondência</th>
                    <th className="px-2 py-1.5 text-right">Buscas/mês</th>
                    <th className="px-2 py-1.5">Concorrência</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((k, i) => (
                    <tr key={`${k.text}-${k.matchType}`} className="border-t border-border">
                      <td className="px-2 py-1">{k.matchType === 'EXACT' ? `[${k.text}]` : k.matchType === 'PHRASE' ? `"${k.text}"` : k.text}</td>
                      <td className="px-2 py-1">
                        <Select
                          aria-label={`Correspondência de ${k.text}`}
                          className="h-8 w-28 text-xs"
                          value={k.matchType}
                          onChange={(e) => setKeywords((list) => list.map((x, j) => (j === i ? { ...x, matchType: e.target.value as KeywordMatchType } : x)))}
                        >
                          {(Object.keys(MATCH_LABEL) as KeywordMatchType[]).map((m) => (
                            <option key={m} value={m}>
                              {MATCH_LABEL[m]}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-2 py-1 text-right tabular-nums">{k.info?.avgMonthlySearches != null ? formatNumber(k.info.avgMonthlySearches) : '—'}</td>
                      <td className="px-2 py-1">{k.info?.competition ? COMPETITION_LABEL[k.info.competition] : '—'}</td>
                      <td className="px-2 py-1 text-right">
                        <button type="button" aria-label={`Remover ${k.text}`} className="text-subtle hover:text-danger" onClick={() => setKeywords((list) => list.filter((_, j) => j !== i))}>
                          <X className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {ideas && (
            <div className="mt-3 rounded-lg border border-border bg-surface-2 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium">
                  {ideas.source === 'google' ? 'Ideias do Planejador do Google' : 'Ideias da IA'} ({ideas.ideas.length})
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setPicked(new Set(ideas.ideas.map((i) => i.text)))}>
                    Selecionar todas
                  </Button>
                  <Button
                    size="sm"
                    icon={<ListPlus className="size-3.5" />}
                    disabled={picked.size === 0}
                    onClick={() => {
                      ideas.ideas.filter((i) => picked.has(i.text)).forEach((i) => addKeyword(i.text, i.suggestedMatchType ?? 'PHRASE', i));
                      if (ideas.negatives.length) setNegatives((n) => [...new Set([...n.split('\n').filter(Boolean), ...ideas.negatives])].join('\n'));
                      setIdeas(null);
                    }}
                  >
                    Adicionar selecionadas ({picked.size})
                  </Button>
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {ideas.ideas.map((i) => (
                  <label key={i.text} className="flex items-center gap-2 border-t border-border py-1 text-xs">
                    <input
                      type="checkbox"
                      checked={picked.has(i.text)}
                      onChange={(e) =>
                        setPicked((s) => {
                          const n = new Set(s);
                          if (e.target.checked) n.add(i.text);
                          else n.delete(i.text);
                          return n;
                        })
                      }
                    />
                    <span className="flex-1">{i.text}</span>
                    {i.avgMonthlySearches != null && <span className="tabular-nums text-muted">{formatNumber(i.avgMonthlySearches)}/mês</span>}
                    {i.competition && <Badge>{COMPETITION_LABEL[i.competition]}</Badge>}
                    {i.lowBid != null && i.highBid != null && (
                      <span className="tabular-nums text-subtle">
                        lance {formatNumber(i.lowBid, 2)}–{formatNumber(i.highBid, 2)}
                      </span>
                    )}
                    {i.note && <span className="text-subtle">{i.note}</span>}
                  </label>
                ))}
              </div>
              {ideas.notes.map((n) => (
                <p key={n} className="mt-1 text-[11px] text-subtle">
                  {n}
                </p>
              ))}
            </div>
          )}
          <Field label="Palavras negativas (uma por linha)" htmlFor="sb-neg" className="mt-3" hint="Evitam cliques sem intenção de compra (ex.: grátis, emprego).">
            <Textarea id="sb-neg" value={negatives} onChange={(e) => setNegatives(e.target.value)} />
          </Field>
        </section>

        <section>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">Anúncio responsivo de pesquisa</p>
            <Button size="sm" variant="secondary" loading={approved.isPending} onClick={() => approved.mutate()}>
              Usar criativos aprovados
            </Button>
          </div>
          <div className="mb-3 grid gap-3 md:grid-cols-2">
            <Field label="Caminho 1" htmlFor="sb-p1" hint="Até 15 caracteres.">
              <Input id="sb-p1" maxLength={15} value={path1} onChange={(e) => setPath1(e.target.value.replace(/[\s/]/g, ''))} />
            </Field>
            <Field label="Caminho 2" htmlFor="sb-p2">
              <Input id="sb-p2" maxLength={15} value={path2} onChange={(e) => setPath2(e.target.value.replace(/[\s/]/g, ''))} />
            </Field>
          </div>
          <p className="mb-1 text-xs font-medium text-muted">Títulos ({headlines.filter(Boolean).length}/15 · mínimo 3)</p>
          <div className="grid gap-1.5 md:grid-cols-2">
            {headlines.map((h, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Input aria-label={`Título ${i + 1}`} className="h-9" value={h} onChange={(e) => setHeadlines((l) => l.map((x, j) => (j === i ? e.target.value : x)))} />
                <CharCount text={h} kind="google_rsa_headline" />
                {headlines.length > 3 && (
                  <button type="button" aria-label={`Remover título ${i + 1}`} className="text-subtle hover:text-danger" onClick={() => setHeadlines((l) => l.filter((_, j) => j !== i))}>
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {headlines.length < 15 && (
            <Button size="sm" variant="ghost" className="mt-1" icon={<Plus className="size-3.5" />} onClick={() => setHeadlines((l) => [...l, ''])}>
              Adicionar título
            </Button>
          )}
          <p className="mb-1 mt-3 text-xs font-medium text-muted">Descrições ({descriptions.filter(Boolean).length}/4 · mínimo 2)</p>
          <div className="flex flex-col gap-1.5">
            {descriptions.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Input aria-label={`Descrição ${i + 1}`} className="h-9" value={d} onChange={(e) => setDescriptions((l) => l.map((x, j) => (j === i ? e.target.value : x)))} />
                <CharCount text={d} kind="google_rsa_description" />
                {descriptions.length > 2 && (
                  <button type="button" aria-label={`Remover descrição ${i + 1}`} className="text-subtle hover:text-danger" onClick={() => setDescriptions((l) => l.filter((_, j) => j !== i))}>
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {descriptions.length < 4 && (
            <Button size="sm" variant="ghost" className="mt-1" icon={<Plus className="size-3.5" />} onClick={() => setDescriptions((l) => [...l, ''])}>
              Adicionar descrição
            </Button>
          )}

          <div className="mt-4 rounded-xl border border-border bg-white p-4 text-[#202124]" aria-label="Prévia do anúncio">
            <p className="text-xs">
              <span className="font-semibold">Patrocinado</span> · {host}
              {path1 && `/${path1}`}
              {path2 && `/${path2}`}
            </p>
            <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{previewHeadlines || 'Seus títulos aparecem aqui'}</p>
            <p className="mt-1 text-sm text-[#4d5156]">{descriptions.filter(Boolean).slice(0, 2).join(' ') || 'Suas descrições aparecem aqui.'}</p>
            <p className="mt-2 text-[10px] text-[#70757a]">Prévia aproximada: o Google combina títulos e descrições automaticamente.</p>
          </div>
        </section>
      </div>
    </Modal>
  );
}
