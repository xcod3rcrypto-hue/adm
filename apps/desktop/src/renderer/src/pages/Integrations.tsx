import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, ExternalLink, KeyRound, Link2Off, PlugZap, RefreshCw, ShieldCheck } from 'lucide-react';
import { formatDateTime, isoDay, type AdvertisingAccount, type IntegrationView, type Platform } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrg, useOrgId } from '../lib/org';
import { Badge, Button, Card, CardHeader, ConfirmDialog, ErrorState, Field, Input, LoadingState, Notice, PageHeader, Select, useToast } from '../components/ui';

const STATE: Record<IntegrationView['state'], { label: string; tone: 'neutral' | 'info' | 'success' | 'danger' }> = {
  not_configured: { label: 'Não configurado', tone: 'neutral' },
  configured: { label: 'Credenciais salvas — não verificado', tone: 'info' },
  connected: { label: 'Conectado', tone: 'success' },
  error: { label: 'Erro', tone: 'danger' },
};

function DocLink({ href, children }: { href: string; children: ReactNode }) {
  const toast = useToast();
  return (
    <button type="button" className="inline-flex items-center gap-1 text-[#b9a8ff] hover:underline" onClick={() => api('app.openExternal', { url: href }).catch((e: unknown) => toast.error(e))}>
      {children} <ExternalLink className="size-3" />
    </button>
  );
}

export function IntegrationsPage() {
  const organizationId = useOrgId();
  const { org } = useOrg();
  const list = useQuery({ queryKey: ['integrations', organizationId], queryFn: () => api('integration.list', { organizationId }) });

  return (
    <>
      <PageHeader
        title="Integrações"
        description="Conecte contas pelas APIs oficiais. Credenciais são cifradas pelo Windows (DPAPI) e nunca são exibidas novamente nem enviadas à interface."
      />
      {org?.isDemo && (
        <div className="mb-5">
          <Notice tone="warning" title="Organização de demonstração">
            Contas reais não podem ser conectadas à organização demo. Selecione ou crie uma organização real no menu lateral.
          </Notice>
        </div>
      )}
      {list.isLoading && <LoadingState rows={4} />}
      {list.error && <ErrorState error={list.error} onRetry={() => void list.refetch()} />}
      {list.data && (
        <div className="grid gap-6">
          <MetaCard view={list.data.find((v) => v.platform === 'meta')!} disabled={!!org?.isDemo} />
          <GoogleCard view={list.data.find((v) => v.platform === 'google')!} disabled={!!org?.isDemo} />
        </div>
      )}
    </>
  );
}

function useIntegrationMutation<T>(fn: () => Promise<T>, success?: (r: T) => string) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: fn,
    onSuccess: async (r) => {
      if (success) toast.success(success(r));
      await qc.invalidateQueries({ queryKey: ['integrations'] });
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      await qc.invalidateQueries({ queryKey: ['onboarding'] });
    },
    onError: async (e) => {
      toast.error(e);
      await qc.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

function StatusLine({ view }: { view: IntegrationView }) {
  const s = STATE[view.state];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
      <Badge tone={s.tone}>{s.label}</Badge>
      {view.identity && <span>Conta: {view.identity}</span>}
      {view.lastCheckedAt && <span>· Última verificação {formatDateTime(view.lastCheckedAt)}</span>}
      <span>· API {view.apiVersion}</span>
    </div>
  );
}

function MetaCard({ view, disabled }: { view: IntegrationView; disabled: boolean }) {
  const organizationId = useOrgId();
  const [token, setToken] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [version, setVersion] = useState(view.apiVersion);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const save = useIntegrationMutation(() => api('integration.meta.save', { organizationId, accessToken: token || undefined, appSecret: appSecret || undefined, apiVersion: version }), () => {
    setToken('');
    setAppSecret('');
    return 'Configuração da Meta salva.';
  });
  const test = useIntegrationMutation(() => api('integration.meta.test', { organizationId }), (v) => `Conexão verificada: ${v.identity}`);
  const syncAccounts = useIntegrationMutation(() => api('integration.meta.syncAccounts', { organizationId }), (l) => `${l.length} conta(s) de anúncios encontrada(s).`);
  const disconnect = useIntegrationMutation(() => api('integration.disconnect', { organizationId, platform: 'meta' }), () => {
    setConfirmDisconnect(false);
    return 'Meta Ads desconectado; credenciais removidas.';
  });
  const hasToken = view.configuredFields.includes('accessToken');
  const hasAppSecret = view.configuredFields.includes('appSecret');

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-meta" /> Meta Ads — Marketing API
          </span>
        }
        description={<StatusLine view={view} />}
        actions={
          hasToken && (
            <Button variant="ghost" size="sm" icon={<Link2Off className="size-3.5" />} onClick={() => setConfirmDisconnect(true)}>
              Desconectar
            </Button>
          )
        }
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-3 text-sm text-muted">
          <p className="flex items-center gap-2 font-medium text-fg">
            <KeyRound className="size-4" /> O que é necessário
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Um aplicativo no Meta for Developers com o produto Marketing API.</li>
            <li>
              Token de acesso de <b className="text-fg">usuário do sistema</b> (Business Manager) ou de usuário com a permissão <code className="text-fg">ads_read</code> (leitura). Para publicar, pausar/ativar e alterar orçamentos pelo app, o token precisa de{' '}
              <code className="text-fg">ads_management</code> (e, fora do modo de desenvolvimento, revisão do app pela Meta).
            </li>
            <li>Tokens de usuário comuns expiram; prefira token de usuário do sistema para uso contínuo.</li>
          </ul>
          <div className="flex flex-wrap gap-4 text-xs">
            <DocLink href="https://developers.facebook.com/docs/marketing-api/get-started">Primeiros passos</DocLink>
            <DocLink href="https://developers.facebook.com/docs/marketing-api/system-users">Usuários do sistema</DocLink>
            <DocLink href="https://developers.facebook.com/docs/graph-api/changelog">Versões da API</DocLink>
          </div>
          {view.lastError && <Notice tone="danger" title="Último erro">{view.lastError}</Notice>}
        </div>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <Field label="Token de acesso" htmlFor="meta-token" hint={hasToken ? 'Já existe um token salvo. Preencha somente para substituí-lo.' : 'O token é cifrado e não poderá ser visualizado depois.'}>
            <Input id="meta-token" type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} placeholder={hasToken ? '••••••••••••' : 'EAA…'} disabled={disabled} />
          </Field>
          <Field
            label="Chave secreta do aplicativo (opcional)"
            htmlFor="meta-app-secret"
            hint={
              hasAppSecret
                ? 'Já existe uma chave salva. Preencha somente para substituí-la.'
                : 'Meta for Developers → seu app → Configurações → Básico. Assina cada chamada (appsecret_proof); a chave nunca é enviada nem exibida.'
            }
          >
            <Input id="meta-app-secret" type="password" autoComplete="off" value={appSecret} onChange={(e) => setAppSecret(e.target.value)} placeholder={hasAppSecret ? '••••••••••••' : '32 caracteres'} disabled={disabled} />
          </Field>
          <Field label="Versão da Graph API" htmlFor="meta-version" hint="Verifique a versão vigente no changelog da Meta.">
            <Input id="meta-version" value={version} onChange={(e) => setVersion(e.target.value)} disabled={disabled} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="secondary" loading={save.isPending} disabled={disabled}>
              Salvar
            </Button>
            <Button icon={<ShieldCheck className="size-4" />} loading={test.isPending} disabled={disabled || !hasToken} onClick={() => test.mutate()}>
              Testar conexão
            </Button>
            <Button variant="outline" icon={<RefreshCw className="size-4" />} loading={syncAccounts.isPending} disabled={disabled || !hasToken} onClick={() => syncAccounts.mutate()}>
              Buscar contas de anúncios
            </Button>
          </div>
        </form>
      </div>
      <Accounts platform="meta" accounts={view.accounts} disabled={disabled} />
      <ConfirmDialog
        open={confirmDisconnect}
        title="Desconectar Meta Ads?"
        danger
        confirmLabel="Desconectar"
        message="O token salvo e a lista de contas serão removidos deste computador. Campanhas e métricas já importadas permanecem no histórico."
        loading={disconnect.isPending}
        onConfirm={() => disconnect.mutate()}
        onClose={() => setConfirmDisconnect(false)}
      />
    </Card>
  );
}

function GoogleCard({ view, disabled }: { view: IntegrationView; disabled: boolean }) {
  const organizationId = useOrgId();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [developerToken, setDeveloperToken] = useState('');
  const [loginCustomerId, setLoginCustomerId] = useState('');
  const [version, setVersion] = useState(view.apiVersion);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const has = (f: string) => view.configuredFields.includes(f);

  const save = useIntegrationMutation(
    () =>
      api('integration.google.save', {
        organizationId,
        clientId: clientId || undefined,
        clientSecret: clientSecret || undefined,
        developerToken: developerToken || undefined,
        loginCustomerId: loginCustomerId.replace(/-/g, ''),
        apiVersion: version,
      }),
    () => {
      setClientSecret('');
      setDeveloperToken('');
      return 'Configuração do Google Ads salva.';
    },
  );
  const authorize = useIntegrationMutation(() => api('integration.google.authorize', { organizationId }), () => 'Conta Google autorizada.');
  const syncAccounts = useIntegrationMutation(() => api('integration.google.syncAccounts', { organizationId }), (l) => `${l.length} conta(s) acessível(is) encontrada(s).`);
  const disconnect = useIntegrationMutation(() => api('integration.disconnect', { organizationId, platform: 'google' }), () => {
    setConfirmDisconnect(false);
    return 'Google Ads desconectado; autorização revogada e credenciais removidas.';
  });
  const canAuthorize = has('clientId') && has('clientSecret');
  const authorized = has('refreshToken');

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-google" /> Google Ads API
          </span>
        }
        description={<StatusLine view={view} />}
        actions={
          view.configuredFields.length > 0 && (
            <Button variant="ghost" size="sm" icon={<Link2Off className="size-3.5" />} onClick={() => setConfirmDisconnect(true)}>
              Desconectar
            </Button>
          )
        }
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-3 text-sm text-muted">
          <p className="flex items-center gap-2 font-medium text-fg">
            <KeyRound className="size-4" /> O que é necessário
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              Projeto no Google Cloud com a <b className="text-fg">Google Ads API</b> ativada e um cliente OAuth do tipo <b className="text-fg">“App para computador”</b> (Client ID e Client Secret).
            </li>
            <li>
              <b className="text-fg">Developer token</b> da conta de administrador (MCC), no Centro de API. Tokens com acesso “de teste” só funcionam em contas de teste; contas reais exigem acesso básico ou padrão.
            </li>
            <li>Login customer ID (opcional): ID da MCC quando você acessa contas gerenciadas por ela.</li>
            <li>A autorização abre o navegador do sistema (OAuth com PKCE e retorno em 127.0.0.1).</li>
          </ul>
          <div className="flex flex-wrap gap-4 text-xs">
            <DocLink href="https://developers.google.com/google-ads/api/docs/get-started/introduction">Primeiros passos</DocLink>
            <DocLink href="https://developers.google.com/google-ads/api/docs/api-policy/developer-token">Developer token</DocLink>
            <DocLink href="https://console.cloud.google.com/apis/credentials">Credenciais OAuth</DocLink>
          </div>
          {view.lastError && <Notice tone="danger" title="Último erro">{view.lastError}</Notice>}
        </div>
        <form
          className="grid grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <Field label="Client ID" htmlFor="g-cid" className="col-span-2" hint={has('clientId') ? 'Salvo. Preencha para substituir.' : undefined}>
            <Input id="g-cid" autoComplete="off" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder={has('clientId') ? '••••.apps.googleusercontent.com' : '….apps.googleusercontent.com'} disabled={disabled} />
          </Field>
          <Field label="Client Secret" htmlFor="g-secret" hint={has('clientSecret') ? 'Salvo.' : undefined}>
            <Input id="g-secret" type="password" autoComplete="off" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} placeholder={has('clientSecret') ? '••••••••' : ''} disabled={disabled} />
          </Field>
          <Field label="Developer token" htmlFor="g-dev" hint={has('developerToken') ? 'Salvo.' : undefined}>
            <Input id="g-dev" type="password" autoComplete="off" value={developerToken} onChange={(e) => setDeveloperToken(e.target.value)} placeholder={has('developerToken') ? '••••••••' : ''} disabled={disabled} />
          </Field>
          <Field label="Login customer ID (opcional)" htmlFor="g-login" hint="10 dígitos, sem hífens.">
            <Input id="g-login" value={loginCustomerId} onChange={(e) => setLoginCustomerId(e.target.value)} placeholder={has('loginCustomerId') ? 'Salvo' : '1234567890'} disabled={disabled} />
          </Field>
          <Field label="Versão da API" htmlFor="g-version">
            <Input id="g-version" value={version} onChange={(e) => setVersion(e.target.value)} disabled={disabled} />
          </Field>
          <div className="col-span-2 flex flex-wrap gap-2">
            <Button type="submit" variant="secondary" loading={save.isPending} disabled={disabled}>
              Salvar
            </Button>
            <Button icon={<PlugZap className="size-4" />} loading={authorize.isPending} disabled={disabled || !canAuthorize} onClick={() => authorize.mutate()}>
              {authorized ? 'Autorizar novamente' : 'Autorizar no navegador'}
            </Button>
            <Button variant="outline" icon={<RefreshCw className="size-4" />} loading={syncAccounts.isPending} disabled={disabled || !authorized || !has('developerToken')} onClick={() => syncAccounts.mutate()}>
              Buscar contas
            </Button>
          </div>
          {authorize.isPending && <p className="col-span-2 text-xs text-info">Conclua a autorização no navegador que foi aberto (tempo limite: 5 minutos).</p>}
        </form>
      </div>
      <Accounts platform="google" accounts={view.accounts} disabled={disabled} />
      <ConfirmDialog
        open={confirmDisconnect}
        title="Desconectar Google Ads?"
        danger
        confirmLabel="Desconectar"
        message="A autorização será revogada no Google (quando possível) e todas as credenciais salvas serão removidas. Campanhas e métricas importadas permanecem no histórico."
        loading={disconnect.isPending}
        onConfirm={() => disconnect.mutate()}
        onClose={() => setConfirmDisconnect(false)}
      />
    </Card>
  );
}

function Accounts({ platform, accounts, disabled }: { platform: Platform; accounts: AdvertisingAccount[]; disabled: boolean }) {
  if (accounts.length === 0) return null;
  return (
    <div className="border-t border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-left text-xs text-subtle">
          <tr>
            <th className="px-5 py-2 font-medium">Conta de anúncios</th>
            <th className="px-5 py-2 font-medium">Moeda</th>
            <th className="px-5 py-2 font-medium">Status</th>
            <th className="px-5 py-2 font-medium">Última sincronização</th>
            <th className="px-5 py-2" />
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <AccountRow key={a.id} platform={platform} account={a} disabled={disabled} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountRow({ platform, account, disabled }: { platform: Platform; account: AdvertisingAccount; disabled: boolean }) {
  const organizationId = useOrgId();
  const [days, setDays] = useState('30');
  const campaigns = useIntegrationMutation(
    () => api(platform === 'meta' ? 'integration.meta.syncCampaigns' : 'integration.google.syncCampaigns', { organizationId, accountId: account.id }),
    (r) => r.message,
  );
  const insights = useIntegrationMutation(
    () =>
      api(platform === 'meta' ? 'integration.meta.syncInsights' : 'integration.google.syncInsights', {
        organizationId,
        accountId: account.id,
        from: isoDay(-(Number(days) - 1)),
        to: isoDay(0),
      }),
    (r) => r.message,
  );
  return (
    <tr className="border-t border-border">
      <td className="px-5 py-2.5">
        <p className="font-medium">{account.name}</p>
        <p className="text-xs text-subtle">ID {account.remoteId}</p>
      </td>
      <td className="px-5 py-2.5">{account.currency ?? '—'}</td>
      <td className="px-5 py-2.5 text-xs text-muted">{account.status ?? '—'}</td>
      <td className="px-5 py-2.5 text-xs text-muted">{formatDateTime(account.lastSyncedAt)}</td>
      <td className="px-5 py-2.5">
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" icon={<RefreshCw className="size-3.5" />} loading={campaigns.isPending} disabled={disabled} onClick={() => campaigns.mutate()}>
            Importar campanhas
          </Button>
          <Select aria-label="Período de métricas" value={days} onChange={(e) => setDays(e.target.value)} className="h-8 w-28 text-xs">
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
          </Select>
          <Button size="sm" variant="outline" icon={<BarChart3 className="size-3.5" />} loading={insights.isPending} disabled={disabled} onClick={() => insights.mutate()}>
            Importar métricas
          </Button>
        </div>
      </td>
    </tr>
  );
}
