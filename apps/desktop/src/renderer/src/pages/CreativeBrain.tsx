import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Copy, Download, Lightbulb, Sparkles, ThumbsDown, ThumbsUp, Wand2 } from 'lucide-react';
import { formatCurrency, formatDateTime, formatNumber, formatPercent, type AdPerformance, type CreativePattern, type Platform } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrg, useOrgId } from '../lib/org';
import { PLATFORM_LABEL } from '../lib/labels';
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, Field, LoadingState, Notice, PageHeader, Select, Stat, useToast } from '../components/ui';

const FEATURE_CHIPS = ['angulo', 'gancho', 'emocao'] as const;
const CHIP_LABEL: Record<string, string> = {
  beneficio: 'benefício',
  dor: 'dor',
  curiosidade: 'curiosidade',
  prova_social: 'prova social',
  oferta: 'oferta',
  autoridade: 'autoridade',
  urgencia: 'urgência',
  comparacao: 'comparação',
  novidade: 'novidade',
  identificacao: 'identificação',
  pergunta: 'abre com pergunta',
  afirmacao_ousada: 'afirmação ousada',
  numero_dado: 'abre com número',
  historia: 'história',
  comando: 'comando',
  problema: 'problema',
  beneficio_direto: 'benefício direto',
  confianca: 'confiança',
  alivio: 'alívio',
  desejo: 'desejo',
  medo: 'medo',
  alegria: 'alegria',
  orgulho: 'orgulho',
  neutra: 'neutra',
};

export function CreativeBrainPage() {
  const organizationId = useOrgId();
  const { org } = useOrg();
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [accountId, setAccountId] = useState('');
  const [days, setDays] = useState<30 | 90 | 180>(90);

  const report = useQuery({
    queryKey: ['brain', organizationId, platform],
    queryFn: () => api('brain.report', { organizationId, platform: platform || null, projectId: null }),
  });
  const integrations = useQuery({ queryKey: ['integrations', organizationId], queryFn: () => api('integration.list', { organizationId }), enabled: !org?.isDemo });
  const accounts = useMemo(
    () => (integrations.data ?? []).flatMap((i) => i.accounts).filter((a) => !a.name.endsWith(' (MCC)')),
    [integrations.data],
  );
  const selected = accounts.find((a) => a.id === accountId) ?? accounts[0];

  const refresh = () => qc.invalidateQueries({ queryKey: ['brain'] });
  const sync = useMutation({
    mutationFn: () => api('brain.sync', { organizationId, platform: selected!.platform, request: { accountId: selected!.id, days } }),
    onSuccess: async (r) => {
      toast.success(r.message);
      await refresh();
    },
    onError: (e) => toast.error(e),
  });
  const tag = useMutation({
    mutationFn: () => api('brain.tag', { organizationId }),
    onSuccess: async (r) => {
      toast.success(`${r.tagged} criativo(s) classificado(s)${r.remaining ? `; faltam ${r.remaining}` : ''}.`);
      await refresh();
    },
    onError: (e) => toast.error(e),
  });
  const playbook = useMutation({
    mutationFn: () => api('brain.playbook', { organizationId }),
    onSuccess: async () => {
      toast.success('Playbook criativo atualizado.');
      await refresh();
    },
    onError: (e) => toast.error(e),
  });
  const useLearnings = useMutation({
    mutationFn: (enabled: boolean) => api('brain.setUseLearnings', { organizationId, enabled }),
    onSuccess: refresh,
    onError: (e) => toast.error(e),
  });

  const r = report.data;
  const positives = r?.patterns.filter((p) => p.direction === 'positive') ?? [];
  const negatives = r?.patterns.filter((p) => p.direction === 'negative') ?? [];
  const currency = r?.winners[0]?.currency ?? 'BRL';

  return (
    <>
      <PageHeader
        title="Cérebro criativo"
        description="Aprende com o desempenho real dos seus anúncios: descobre quais ganchos, ângulos e formatos prendem a atenção do seu público e usa isso para gerar os próximos criativos."
        actions={
          <Select aria-label="Plataforma" value={platform} onChange={(e) => setPlatform(e.target.value as Platform | '')} className="w-48">
            <option value="">Todas as plataformas</option>
            <option value="meta">Meta Ads</option>
            <option value="google">Google Ads</option>
          </Select>
        }
      />

      {org?.isDemo && (
        <Notice tone="warning" title="Dados de demonstração">
          Os anúncios e números abaixo são fictícios e servem para conhecer a tela. Em uma organização real, importe o desempenho das suas contas.
        </Notice>
      )}

      {!org?.isDemo && (
        <Card className="mb-6">
          <CardHeader
            title="Importar desempenho dos anúncios"
            description="Busca, para cada anúncio, impressões, cliques, conversões e o texto do criativo. Só leitura: nada é alterado nas plataformas."
          />
          <div className="flex flex-wrap items-end gap-3 p-5">
            <Field label="Conta de anúncios" htmlFor="brain-account" className="min-w-64">
              <Select id="brain-account" value={selected?.id ?? ''} onChange={(e) => setAccountId(e.target.value)} disabled={accounts.length === 0}>
                {accounts.length === 0 && <option value="">Nenhuma conta sincronizada</option>}
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {PLATFORM_LABEL[a.platform]} · {a.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Período" htmlFor="brain-days">
              <Select id="brain-days" value={String(days)} onChange={(e) => setDays(Number(e.target.value) as 30 | 90 | 180)}>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="180">Últimos 180 dias</option>
              </Select>
            </Field>
            <Button icon={<Download className="size-4" />} loading={sync.isPending} disabled={!selected} onClick={() => sync.mutate()}>
              Importar desempenho
            </Button>
            {accounts.length === 0 && <p className="pb-2 text-xs text-subtle">Conecte e sincronize as contas em Integrações.</p>}
          </div>
        </Card>
      )}

      {report.isLoading && <LoadingState rows={4} />}
      {report.error && <ErrorState error={report.error} onRetry={() => void report.refetch()} />}

      {r && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Anúncios analisados" value={formatNumber(r.analyzedAds)} sub={`${formatNumber(r.totals.ads)} importados${r.periodFrom ? ` · ${r.periodFrom} a ${r.periodTo}` : ''}`} />
            <Stat label="Impressões" value={formatNumber(r.totals.impressions)} sub={`${formatNumber(r.totals.clicks)} cliques`} />
            <Stat label="CTR médio" value={formatPercent(r.totals.ctr)} sub={`Taxa de conversão ${formatPercent(r.totals.conversionRate)}`} />
            <Stat label="Padrões encontrados" value={formatNumber(r.patterns.length)} sub={`${positives.length} a favor · ${negatives.length} contra`} />
          </div>

          <Card>
            <div className="flex flex-wrap items-center gap-4 p-5">
              <label className="flex flex-1 items-center gap-3 text-sm">
                <input type="checkbox" checked={r.useLearnings} disabled={useLearnings.isPending} onChange={(e) => useLearnings.mutate(e.target.checked)} />
                <span>
                  <strong>Usar os aprendizados ao gerar</strong> textos, anúncios de Pesquisa, imagens e a Fábrica de criativos.
                  <span className="block text-xs text-subtle">Os padrões fortes e o playbook entram como orientação para a IA.</span>
                </span>
              </label>
              {r.pendingAiTagging > 0 && (
                <Button variant="outline" icon={<Sparkles className="size-4" />} loading={tag.isPending} onClick={() => tag.mutate()}>
                  Classificar {r.pendingAiTagging} criativo(s) com IA
                </Button>
              )}
            </div>
          </Card>

          {r.totals.ads === 0 ? (
            <EmptyState icon={<BrainCircuit className="size-5" />} title="O cérebro ainda não tem dados" description="Importe o desempenho dos anúncios de uma conta para descobrir o que funciona no seu público." />
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              <PatternColumn title="O que prende a atenção e converte" icon={<ThumbsUp className="size-4 text-success" />} items={positives} empty="Nenhum padrão positivo forte ainda." />
              <PatternColumn title="O que evitar" icon={<ThumbsDown className="size-4 text-danger" />} items={negatives} empty="Nenhum padrão negativo forte ainda." />
            </div>
          )}

          {r.totals.ads > 0 && (
            <Card>
              <CardHeader
                title={<span className="flex items-center gap-2"><Lightbulb className="size-4" /> Playbook criativo</span>}
                description="Regras práticas escritas pela IA a partir dos padrões e dos anúncios vencedores e perdedores."
                actions={
                  <Button size="sm" variant="outline" icon={<Wand2 className="size-3.5" />} loading={playbook.isPending} onClick={() => playbook.mutate()}>
                    {r.playbook ? 'Atualizar playbook' : 'Gerar playbook com IA'}
                  </Button>
                }
              />
              <div className="p-5">
                {r.playbook ? (
                  <>
                    <p className="selectable text-sm text-fg/90">{r.playbook.summary}</p>
                    <ol className="selectable mt-3 list-decimal space-y-1.5 pl-5 text-sm">
                      {r.playbook.rules.map((rule, i) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ol>
                    <p className="mt-3 text-xs text-subtle">
                      Gerado em {formatDateTime(r.playbook.createdAt)} · {r.playbook.model}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted">Gere o playbook para transformar os padrões em regras para os próximos anúncios.</p>
                )}
              </div>
            </Card>
          )}

          {r.winners.length > 0 && (
            <div className="grid gap-6 xl:grid-cols-2">
              <AdList title="Anúncios vencedores" ads={r.winners} currency={currency} onMultiply={(id) => navigate(`/fabrica?vencedor=${id}`)} />
              {r.losers.length > 0 && <AdList title="Anúncios com pior desempenho" ads={r.losers} currency={currency} />}
            </div>
          )}

          <Notice tone="info" title="Como ler">
            <ul className="list-disc space-y-1 pl-4">
              {r.limitations.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </Notice>
        </div>
      )}
    </>
  );
}

function PatternColumn({ title, icon, items, empty }: { title: string; icon: React.ReactNode; items: CreativePattern[]; empty: string }) {
  return (
    <Card>
      <CardHeader title={<span className="flex items-center gap-2">{icon} {title}</span>} />
      <div className="flex flex-col gap-3 p-5">
        {items.length === 0 && <p className="text-sm text-muted">{empty}</p>}
        {items.map((p) => {
          const max = Math.max(p.rate, p.baselineRate);
          return (
            <div key={`${p.feature}:${p.value}:${p.metric}`} className="rounded-lg border border-border bg-surface-2 p-3">
              <p className="selectable text-sm">{p.sentence}</p>
              <div className="mt-2 grid grid-cols-[88px_1fr_56px] items-center gap-x-2 gap-y-1 text-[11px] text-subtle">
                <span>Com o padrão</span>
                <span className="h-1.5 rounded bg-surface-3">
                  <span className={`block h-1.5 rounded ${p.direction === 'positive' ? 'bg-success' : 'bg-danger'}`} style={{ width: `${(p.rate / max) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{formatPercent(p.rate)}</span>
                <span>Demais</span>
                <span className="h-1.5 rounded bg-surface-3">
                  <span className="block h-1.5 rounded bg-muted" style={{ width: `${(p.baselineRate / max) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{formatPercent(p.baselineRate)}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge>{p.metric === 'ctr' ? 'Atenção (CTR)' : 'Conversão'}</Badge>
                <Badge tone={p.confidence >= 0.95 ? 'success' : 'warning'}>Confiança {Math.round(p.confidence * 100)}%</Badge>
                <Badge>{p.ads} anúncio(s)</Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AdList({ title, ads, currency, onMultiply }: { title: string; ads: AdPerformance[]; currency: string; onMultiply?: (id: string) => void }) {
  return (
    <Card>
      <CardHeader title={title} />
      <ul className="divide-y divide-border">
        {ads.map((a) => (
          <li key={a.id} className="flex gap-3 p-4">
            {a.imageUrl && <img src={a.imageUrl} alt="" className="size-14 shrink-0 rounded-md object-cover" referrerPolicy="no-referrer" />}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={a.platform}>{PLATFORM_LABEL[a.platform]}</Badge>
                <p className="truncate text-sm font-medium" title={a.adName}>
                  {a.headline || a.adName}
                </p>
              </div>
              {a.body && <p className="selectable mt-1 line-clamp-2 text-xs text-muted">{a.body}</p>}
              <div className="mt-2 flex flex-wrap gap-1">
                {FEATURE_CHIPS.map((f) => a.features[f] && <Badge key={f}>{CHIP_LABEL[a.features[f]!] ?? a.features[f]}</Badge>)}
              </div>
              <p className="mt-2 text-xs tabular-nums text-subtle">
                {formatNumber(a.impressions)} impr. · CTR {formatPercent(a.ctr)} · {formatNumber(a.conversions, 1)} conv. · CPA {formatCurrency(a.cpa, a.currency || currency)}
              </p>
            </div>
            {onMultiply && (
              <Button size="sm" variant="outline" icon={<Copy className="size-3.5" />} onClick={() => onMultiply(a.id)} title="Gerar variações deste anúncio na Fábrica">
                Multiplicar
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
