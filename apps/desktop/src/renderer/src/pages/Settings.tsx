import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Building2, ExternalLink, FlaskConical, FolderOpen, Gauge, RefreshCw, ScrollText, Stethoscope, Trash2 } from 'lucide-react';
import { formatDateTime } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrg, useOrgId } from '../lib/org';
import { Badge, Button, Card, CardHeader, ConfirmDialog, ErrorState, Field, Input, LoadingState, Notice, PageHeader, useToast } from '../components/ui';

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Configurações" description="Organização, provedor de IA, modo demonstração, diagnóstico e trilha de auditoria." />
      <div className="grid gap-6 xl:grid-cols-2">
        <OrganizationCard />
        <AiCard />
        <UpdatesCard />
        <LimitsCard />
        <DemoCard />
        <DiagnosticsCard />
      </div>
      <div className="mt-6">
        <AuditCard />
      </div>
    </>
  );
}

function OrganizationCard() {
  const { org } = useOrg();
  const qc = useQueryClient();
  const toast = useToast();
  const [name, setName] = useState(org?.name ?? '');
  useEffect(() => setName(org?.name ?? ''), [org?.name]);
  const rename = useMutation({
    mutationFn: () => api('org.rename', { organizationId: org!.id, name }),
    onSuccess: async () => {
      toast.success('Organização atualizada.');
      await qc.invalidateQueries({ queryKey: ['org'] });
    },
    onError: (e) => toast.error(e),
  });
  return (
    <Card>
      <CardHeader title={<span className="flex items-center gap-2"><Building2 className="size-4" /> Organização</span>} description="Dados de cada organização ficam isolados entre si." />
      <form
        className="flex items-end gap-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          rename.mutate();
        }}
      >
        <Field label="Nome" htmlFor="org-name-set" className="flex-1">
          <Input id="org-name-set" value={name} onChange={(e) => setName(e.target.value)} disabled={org?.isDemo} maxLength={120} />
        </Field>
        <Button type="submit" variant="secondary" loading={rename.isPending} disabled={org?.isDemo || name.trim().length < 2 || name === org?.name}>
          Salvar
        </Button>
      </form>
      <p className="px-5 pb-5 text-xs text-subtle">Usuários, papéis e permissões multiusuário dependem de um backend hospedado (ver docs/ROADMAP.md). Nesta versão, há um único usuário local proprietário.</p>
    </Card>
  );
}

function AiCard() {
  const qc = useQueryClient();
  const toast = useToast();
  const cfg = useQuery({ queryKey: ['ai-config'], queryFn: () => api('ai.getConfig') });
  const [model, setModel] = useState('');
  const [key, setKey] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  useEffect(() => {
    if (cfg.data) setModel(cfg.data.model);
  }, [cfg.data]);

  const save = useMutation({
    mutationFn: () => api('ai.saveConfig', { model, apiKey: key || undefined }),
    onSuccess: async (v) => {
      setKey('');
      qc.setQueryData(['ai-config'], v);
      await qc.invalidateQueries({ queryKey: ['onboarding'] });
      toast.success('Provedor de IA salvo.');
    },
    onError: (e) => toast.error(e),
  });
  const test = useMutation({
    mutationFn: () => api('ai.test'),
    onSuccess: (r) => setTestResult(`Conexão OK — modelo ${r.model} respondeu: “${r.reply}”`),
    onError: (e) => {
      setTestResult(null);
      toast.error(e);
    },
  });
  const clear = useMutation({
    mutationFn: () => api('ai.clearKey'),
    onSuccess: async (v) => {
      qc.setQueryData(['ai-config'], v);
      setTestResult(null);
      await qc.invalidateQueries({ queryKey: ['onboarding'] });
      toast.success('Chave removida.');
    },
    onError: (e) => toast.error(e),
  });

  return (
    <Card>
      <CardHeader
        title={<span className="flex items-center gap-2"><Bot className="size-4" /> Provedor de IA</span>}
        description="Geração de textos e análises. Usa a API da Anthropic (Claude) com a sua chave."
        actions={cfg.data && <Badge tone={cfg.data.hasApiKey ? 'success' : 'neutral'}>{cfg.data.hasApiKey ? 'Chave configurada' : 'Sem chave'}</Badge>}
      />
      {cfg.isLoading && <div className="p-5"><LoadingState rows={2} /></div>}
      {cfg.error && <div className="p-5"><ErrorState error={cfg.error} /></div>}
      {cfg.data && (
        <form
          className="flex flex-col gap-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {!cfg.data.secureStorageAvailable && <Notice tone="danger">O armazenamento seguro do Windows não está disponível; não é possível salvar chaves.</Notice>}
          <Notice tone="info">
            Crie uma chave em{' '}
            <button type="button" className="inline-flex items-center gap-1 text-[#b9a8ff] hover:underline" onClick={() => void api('app.openExternal', { url: 'https://platform.claude.com/settings/keys' })}>
              platform.claude.com <ExternalLink className="size-3" />
            </button>
            . O uso é cobrado pela Anthropic na sua conta. Textos do briefing são enviados à API somente quando você gera conteúdo.
          </Notice>
          <Field label="Chave de API" htmlFor="ai-key" hint={cfg.data.hasApiKey ? 'Uma chave já está salva (cifrada). Preencha apenas para substituí-la.' : 'Começa com sk-ant-'}>
            <Input id="ai-key" type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} placeholder={cfg.data.hasApiKey ? '••••••••••••' : 'sk-ant-…'} />
          </Field>
          <Field label="Modelo" htmlFor="ai-model" hint="Padrão: claude-opus-5-5.">
            <Input id="ai-model" value={model} onChange={(e) => setModel(e.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={save.isPending} disabled={!cfg.data.secureStorageAvailable}>
              Salvar
            </Button>
            <Button variant="outline" loading={test.isPending} disabled={!cfg.data.hasApiKey} onClick={() => test.mutate()}>
              Testar conexão
            </Button>
            {cfg.data.hasApiKey && (
              <Button variant="ghost" icon={<Trash2 className="size-4" />} loading={clear.isPending} onClick={() => clear.mutate()}>
                Remover chave
              </Button>
            )}
          </div>
          {testResult && <Notice tone="success">{testResult}</Notice>}
        </form>
      )}
    </Card>
  );
}

function UpdatesCard() {
  const qc = useQueryClient();
  const toast = useToast();
  const state = useQuery({ queryKey: ['update'], queryFn: () => api('app.updateStatus') });
  const check = useMutation({
    mutationFn: () => api('app.checkUpdates'),
    onSuccess: (s) => {
      qc.setQueryData(['update'], s);
      if (s.status === 'up-to-date') toast.success('Você já está na versão mais recente.');
      else if (s.status === 'available') toast.info(`Versão ${s.availableVersion} disponível: use o aviso no topo para atualizar.`);
      else if (s.error) toast.info(s.error);
    },
    onError: (e) => toast.error(e),
  });
  const s = state.data;
  return (
    <Card>
      <CardHeader
        title={<span className="flex items-center gap-2"><RefreshCw className="size-4" /> Atualizações</span>}
        description="O app verifica novas versões ao abrir e a cada 4 horas. Você escolhe quando atualizar; seus dados são mantidos."
      />
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 text-sm">
        <div>
          <p>
            Versão instalada: <b>{s?.currentVersion ?? '—'}</b>
          </p>
          <p className="text-xs text-subtle">
            {s?.status === 'disabled'
              ? 'Atualização automática disponível apenas no app instalado.'
              : s?.status === 'up-to-date'
                ? `Atualizado · verificado em ${formatDateTime(s.checkedAt)}`
                : s?.status === 'available' || s?.status === 'downloading' || s?.status === 'downloaded'
                  ? `Nova versão ${s.availableVersion} disponível.`
                  : (s?.error ?? 'Ainda não verificado.')}
          </p>
        </div>
        <Button variant="secondary" icon={<RefreshCw className="size-4" />} loading={check.isPending || s?.status === 'checking'} disabled={s?.status === 'disabled'} onClick={() => check.mutate()}>
          Verificar agora
        </Button>
      </div>
    </Card>
  );
}

function LimitsCard() {
  const organizationId = useOrgId();
  const { org } = useOrg();
  const qc = useQueryClient();
  const toast = useToast();
  const limits = useQuery({ queryKey: ['publishing-limits', organizationId], queryFn: () => api('publishing.getLimits', { organizationId }) });
  const [maxBudget, setMaxBudget] = useState('');
  const [maxIncrease, setMaxIncrease] = useState('');
  useEffect(() => {
    if (!limits.data) return;
    setMaxBudget(limits.data.maxDailyBudget === null ? '' : String(limits.data.maxDailyBudget));
    setMaxIncrease(limits.data.maxBudgetIncreasePercent === null ? '' : String(limits.data.maxBudgetIncreasePercent));
  }, [limits.data]);
  const save = useMutation({
    mutationFn: () =>
      api('publishing.saveLimits', {
        organizationId,
        limits: { maxDailyBudget: maxBudget === '' ? null : Number(maxBudget), maxBudgetIncreasePercent: maxIncrease === '' ? null : Number(maxIncrease) },
      }),
    onSuccess: async () => {
      toast.success('Limites de publicação salvos.');
      await qc.invalidateQueries({ queryKey: ['publishing-limits', organizationId] });
    },
    onError: (e) => toast.error(e),
  });
  return (
    <Card>
      <CardHeader
        title={<span className="flex items-center gap-2"><Gauge className="size-4" /> Limites de publicação</span>}
        description="Valem para ações manuais e automações: nenhuma alteração de orçamento ultrapassa estes limites."
      />
      {limits.isLoading && <div className="p-5"><LoadingState rows={1} /></div>}
      {limits.error && <div className="p-5"><ErrorState error={limits.error} /></div>}
      {limits.data && (
        <form
          className="grid gap-3 p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <Field label="Orçamento diário máximo por campanha" htmlFor="lim-budget" hint="Na moeda da campanha. Vazio = sem limite.">
            <Input id="lim-budget" type="number" min="0" step="0.01" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} disabled={org?.isDemo} />
          </Field>
          <Field label="Aumento máximo por alteração (%)" htmlFor="lim-increase" hint="Vazio = sem limite. Padrão: 50%.">
            <Input id="lim-increase" type="number" min="1" step="1" value={maxIncrease} onChange={(e) => setMaxIncrease(e.target.value)} disabled={org?.isDemo} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" variant="secondary" loading={save.isPending} disabled={org?.isDemo}>
              Salvar limites
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

function DemoCard() {
  const { orgs } = useOrg();
  const qc = useQueryClient();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const demo = orgs.find((o) => o.isDemo);
  const enable = useMutation({
    mutationFn: () => api('demo.enable'),
    onSuccess: async () => {
      await qc.invalidateQueries();
      toast.success('Organização de demonstração ativada.');
    },
    onError: (e) => toast.error(e),
  });
  const disable = useMutation({
    mutationFn: () => api('demo.disable'),
    onSuccess: async () => {
      setConfirm(false);
      await qc.invalidateQueries();
      toast.success('Dados de demonstração removidos.');
    },
    onError: (e) => toast.error(e),
  });
  return (
    <Card>
      <CardHeader title={<span className="flex items-center gap-2"><FlaskConical className="size-4" /> Modo demonstração</span>} description="Organização separada com dados fictícios para explorar o produto." />
      <div className="flex flex-col gap-4 p-5 text-sm text-muted">
        <p>
          Cria a organização “Demonstração (dados fictícios)” com projetos, campanhas e 90 dias de métricas geradas localmente. Esses dados <b className="text-fg">nunca</b> se misturam com organizações reais e são
          sinalizados em todas as telas.
        </p>
        <div className="flex gap-2">
          {demo ? (
            <Button variant="danger" onClick={() => setConfirm(true)}>
              Remover dados de demonstração
            </Button>
          ) : (
            <Button variant="outline" loading={enable.isPending} onClick={() => enable.mutate()}>
              Criar organização de demonstração
            </Button>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        danger
        title="Remover demonstração?"
        confirmLabel="Remover"
        message="A organização de demonstração e todos os seus dados fictícios serão excluídos. Organizações reais não são afetadas."
        loading={disable.isPending}
        onConfirm={() => disable.mutate()}
        onClose={() => setConfirm(false)}
      />
    </Card>
  );
}

function DiagnosticsCard() {
  const toast = useToast();
  const info = useQuery({ queryKey: ['app-info'], queryFn: () => api('app.getInfo') });
  return (
    <Card>
      <CardHeader title={<span className="flex items-center gap-2"><Stethoscope className="size-4" /> Diagnóstico</span>} description="Versão, caminhos de dados e logs (sem segredos)." />
      {info.data && (
        <div className="flex flex-col gap-4 p-5">
          <dl className="selectable grid grid-cols-[140px_1fr] gap-x-3 gap-y-1.5 text-xs">
            <dt className="text-subtle">Versão</dt>
            <dd>{info.data.version} {info.data.isPackaged ? '(instalado)' : '(desenvolvimento)'}</dd>
            <dt className="text-subtle">Electron</dt>
            <dd>{info.data.electron}</dd>
            <dt className="text-subtle">Plataforma</dt>
            <dd>{info.data.platform}</dd>
            <dt className="text-subtle">Dados</dt>
            <dd className="break-all">{info.data.userDataPath}</dd>
            <dt className="text-subtle">Banco de dados</dt>
            <dd className="break-all">{info.data.databasePath}</dd>
            <dt className="text-subtle">Logs</dt>
            <dd className="break-all">{info.data.logsPath}</dd>
          </dl>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<ScrollText className="size-3.5" />} onClick={() => api('app.openPath', { target: 'logs' }).catch((e: unknown) => toast.error(e))}>
              Abrir pasta de logs
            </Button>
            <Button variant="outline" size="sm" icon={<FolderOpen className="size-3.5" />} onClick={() => api('app.openPath', { target: 'data' }).catch((e: unknown) => toast.error(e))}>
              Abrir pasta de dados
            </Button>
          </div>
          <p className="text-xs text-subtle">Backup: feche o aplicativo e copie a pasta de dados. Um backup automático do banco (advertex.sqlite.bak) é feito a cada inicialização.</p>
        </div>
      )}
    </Card>
  );
}

function AuditCard() {
  const organizationId = useOrgId();
  const audit = useQuery({ queryKey: ['audit', organizationId], queryFn: () => api('audit.list', { organizationId, limit: 100 }) });
  return (
    <Card>
      <CardHeader title="Trilha de auditoria" description="Ações críticas registradas nesta organização (últimas 100)." actions={<Button size="sm" variant="ghost" onClick={() => void audit.refetch()}>Atualizar</Button>} />
      {audit.isLoading && <div className="p-5"><LoadingState rows={3} /></div>}
      {audit.error && <div className="p-5"><ErrorState error={audit.error} /></div>}
      {audit.data && audit.data.length === 0 && <p className="p-5 text-sm text-muted">Nenhum registro.</p>}
      {audit.data && audit.data.length > 0 && (
        <div className="max-h-96 overflow-y-auto">
          <table className="selectable w-full text-xs">
            <thead className="sticky top-0 bg-surface-2 text-left text-subtle">
              <tr>
                <th className="px-5 py-2 font-medium">Quando</th>
                <th className="px-5 py-2 font-medium">Ação</th>
                <th className="px-5 py-2 font-medium">Resultado</th>
                <th className="px-5 py-2 font-medium">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {audit.data.map((a) => (
                <tr key={a.id} className="border-t border-border align-top">
                  <td className="whitespace-nowrap px-5 py-2 text-muted">{formatDateTime(a.createdAt)}</td>
                  <td className="px-5 py-2 font-mono">{a.action}</td>
                  <td className="px-5 py-2">
                    <Badge tone={a.outcome === 'success' ? 'success' : 'danger'}>{a.outcome === 'success' ? 'sucesso' : 'falha'}</Badge>
                  </td>
                  <td className="max-w-md truncate px-5 py-2 font-mono text-muted" title={JSON.stringify(a.details)}>
                    {Object.keys(a.details).length ? JSON.stringify(a.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
