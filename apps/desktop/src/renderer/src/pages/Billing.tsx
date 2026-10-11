import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Pause, Radio, RefreshCw, Wallet } from 'lucide-react';
import { formatCurrency, formatDateTime, type BillingAccountView, type BillingAlert, type BillingKind } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrg, useOrgId } from '../lib/org';
import { PLATFORM_LABEL } from '../lib/labels';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, Notice, PageHeader, Stat, useToast } from '../components/ui';

const KIND_LABEL: Record<BillingKind, string> = {
  prepaid: 'Pré-pago (Pix/boleto)',
  card: 'Cobrança automática (cartão)',
  budget: 'Orçamento da conta',
  unknown: 'Forma de pagamento não informada',
};

const ALERT: Record<BillingAlert, { label: string; tone: 'danger' | 'warning' | 'success' | 'neutral' } | null> = {
  critical: { label: 'Saldo acabando', tone: 'danger' },
  warning: { label: 'Atenção ao saldo', tone: 'warning' },
  ok: { label: 'Saldo em dia', tone: 'success' },
  none: null,
};

const LIVE_MS = 30_000;
const LIVE_KEY = 'billing.live';

function readLive(): boolean {
  try {
    return localStorage.getItem(LIVE_KEY) !== 'off';
  } catch {
    return true;
  }
}

function useSecondsSince(iso: string | undefined): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return iso ? Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000)) : null;
}

const days = (d: number) => (d < 1 ? 'menos de 1 dia' : `${d.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dia(s)`);

export function BillingPage() {
  const organizationId = useOrgId();
  const { org } = useOrg();
  const [live, setLive] = useState(readLive);
  const force = useRef(false);
  const q = useQuery({
    queryKey: ['billing', organizationId],
    queryFn: () => {
      const f = force.current;
      force.current = false;
      return api('billing.overview', { organizationId, force: f });
    },
    // Ao vivo: relê das plataformas a cada 30 s enquanto a janela está visível.
    refetchInterval: live ? LIVE_MS : 5 * 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
  const ago = useSecondsSince(q.data?.checkedAt);
  const toggleLive = () => {
    const next = !live;
    setLive(next);
    try {
      localStorage.setItem(LIVE_KEY, next ? 'on' : 'off');
    } catch {
      /* sem armazenamento: vale só nesta sessão */
    }
  };
  const accounts = q.data?.accounts ?? [];
  const urgent = accounts.filter((a) => a.alert === 'critical' || a.alert === 'warning');
  const byCurrency = new Map<string, number>();
  for (const a of accounts) if (a.avgDailySpend7d) byCurrency.set(a.currency, (byCurrency.get(a.currency) ?? 0) + a.avgDailySpend7d);

  return (
    <>
      <PageHeader
        title="Saldo e pagamentos"
        description="Saldo, gasto, limite e forma de pagamento de cada conta, do jeito que a Meta e o Google informam pela API. Para pagar ou adicionar saldo, o botão abre a página de pagamento da própria plataforma — nenhuma API permite pagar por aplicativos de terceiros."
        actions={
          <div className="flex items-center gap-2">
            <Button variant={live ? 'secondary' : 'ghost'} icon={live ? <Radio className="size-4 text-success" /> : <Pause className="size-4" />} onClick={toggleLive} aria-pressed={live}>
              {live ? 'Ao vivo' : 'Pausado'}
            </Button>
            <Button
              variant="secondary"
              icon={<RefreshCw className="size-4" />}
              loading={q.isFetching}
              onClick={() => {
                force.current = true;
                void q.refetch();
              }}
            >
              Atualizar
            </Button>
          </div>
        }
      />
      {q.isLoading && <LoadingState rows={3} />}
      {q.error && <ErrorState error={q.error} onRetry={() => void q.refetch()} />}
      {q.data && (
        <div className="flex flex-col gap-6">
          {org?.isDemo && (
            <Notice tone="warning" title="Demonstração">
              Valores fictícios para mostrar como o painel funciona com cada tipo de conta.
            </Notice>
          )}
          {urgent.length > 0 && (
            <Notice tone={urgent.some((a) => a.alert === 'critical') ? 'danger' : 'warning'} title="Contas que precisam de saldo">
              {urgent.map((a) => `${a.name}: acaba em ${a.daysLeft === null ? '?' : days(a.daysLeft)}`).join(' · ')}
            </Notice>
          )}

          {accounts.length === 0 ? (
            <EmptyState icon={<Wallet className="size-5" />} title="Nenhuma conta conectada" description="Conecte a Meta ou o Google Ads em Integrações e sincronize as contas de anúncios." />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Stat
                  label="Contas"
                  value={accounts.length}
                  sub={
                    <span className="inline-flex items-center gap-1.5" data-testid="billing-freshness">
                      {live && <span className="size-2 animate-pulse rounded-full bg-success" aria-hidden />}
                      {ago === null ? '' : ago < 5 ? 'Atualizado agora' : ago < 120 ? `Atualizado há ${ago} s` : `Verificado ${formatDateTime(q.data.checkedAt)}`}
                      {live ? ' · ao vivo a cada 30 s' : ''}
                    </span>
                  }
                />
                <Stat
                  label="Gasto médio por dia"
                  value={[...byCurrency].map(([c, v]) => formatCurrency(v, c)).join(' + ') || '—'}
                  sub="últimos 7 dias, todas as contas"
                />
                <Stat label="Alertas" value={urgent.length} sub={urgent.length ? 'contas com saldo para poucos dias' : 'nenhuma conta perto de parar'} tone={urgent.length ? 'down' : 'up'} />
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {accounts.map((a) => (
                  <AccountCard key={a.accountId} a={a} />
                ))}
              </div>
              <p className="text-xs text-subtle">
                Saldo, gasto e limite são lidos direto da Meta e do Google a cada atualização; as próprias plataformas atualizam esses valores com alguns minutos de atraso. A previsão de dias usa o gasto médio dos últimos 7 dias das métricas sincronizadas.
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className={strong ? 'font-semibold tabular-nums text-fg' : 'tabular-nums text-fg/90'}>{value}</span>
    </div>
  );
}

function AccountCard({ a }: { a: BillingAccountView }) {
  const toast = useToast();
  const money = (v: number | null) => (v === null ? '—' : formatCurrency(v, a.currency));
  const alert = ALERT[a.alert];
  const usedPct =
    a.kind === 'budget' && a.budget?.limit ? Math.min(100, (a.budget.served / a.budget.limit) * 100) : a.spendCap && a.amountSpent !== null ? Math.min(100, (a.amountSpent / a.spendCap) * 100) : null;

  return (
    <Card className="flex flex-col p-5" data-testid="billing-account">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-fg">{a.name}</p>
          <p className="mt-0.5 text-xs text-muted">
            {PLATFORM_LABEL[a.platform]} · {KIND_LABEL[a.kind]}
          </p>
        </div>
        {alert && <Badge tone={alert.tone}>{alert.label}</Badge>}
      </div>

      {a.error ? (
        <div className="mt-4">
          <Notice tone="danger" title="Não foi possível ler o faturamento">
            {a.error}
          </Notice>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-border">
          {a.platform === 'meta' && (
            <>
              {a.kind === 'prepaid' && <Row label="Saldo disponível" value={money(a.balance)} strong />}
              {a.kind !== 'prepaid' && <Row label="Saldo a cobrar" value={money(a.balance)} strong />}
              <Row label="Valor já gasto" value={money(a.amountSpent)} />
              <Row label="Limite de gastos da conta" value={a.spendCap === null ? 'Sem limite' : money(a.spendCap)} />
              {a.spendCapRemaining !== null && <Row label="Restante até o limite" value={money(a.spendCapRemaining)} />}
              <Row label="Forma de pagamento" value={a.fundingSource ?? 'Não informada'} />
            </>
          )}
          {a.platform === 'google' && a.budget && (
            <>
              <Row label="Orçamento da conta" value={a.budget.limit === null ? 'Sem limite' : money(a.budget.limit)} strong />
              <Row label="Já consumido" value={money(a.budget.served)} />
              {a.budget.remaining !== null && <Row label="Restante" value={money(a.budget.remaining)} />}
              {a.budget.end && <Row label="Vigência até" value={a.budget.end.slice(0, 10)} />}
            </>
          )}
          <Row label="Gasto médio por dia (7 dias)" value={money(a.avgDailySpend7d)} strong={a.platform === 'google' && !a.budget} />
          <Row label={a.spendTodayLive ? 'Gasto hoje (ao vivo)' : 'Gasto hoje'} value={money(a.spendToday)} />
          {a.daysLeft !== null && <Row label="Previsão" value={`acaba em ${days(a.daysLeft)}`} strong />}
        </div>
      )}

      {usedPct !== null && !a.error && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div className={`h-full rounded-full ${usedPct >= 90 ? 'bg-danger' : usedPct >= 75 ? 'bg-warning' : 'bg-brand'}`} style={{ width: `${usedPct}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-subtle">{usedPct.toFixed(0)}% {a.kind === 'budget' ? 'do orçamento consumido' : 'do limite de gastos usado'}</p>
        </div>
      )}

      {a.notes.length > 0 && <p className="mt-3 text-xs text-muted">{a.notes.join(' ')}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          icon={<ExternalLink className="size-3.5" />}
          onClick={() => api('app.openExternal', { url: a.paymentUrl }).catch((e: unknown) => toast.error(e))}
        >
          {a.kind === 'prepaid' || a.kind === 'unknown' ? 'Adicionar saldo' : 'Abrir pagamentos'}
        </Button>
      </div>
    </Card>
  );
}
