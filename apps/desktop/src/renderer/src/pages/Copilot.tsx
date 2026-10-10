import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bot, Check, CheckCircle2, CircleAlert, MessageSquarePlus, Send, Trash2, User, X } from 'lucide-react';
import { formatCurrency, formatDateTime, type CopilotMessage, type CopilotProposal } from '@advertex/shared';
import { api } from '../lib/api';
import { useOrg, useOrgId } from '../lib/org';
import { Badge, Button, Card, Notice, PageHeader, Textarea, useToast } from '../components/ui';
import { cn } from '../lib/cn';

const SUGGESTIONS = [
  'Como estão minhas campanhas nos últimos 30 dias?',
  'Por que meu CPA subiu? O que devo fazer?',
  'Quais criativos devo escalar e quais pausar?',
  'Quais termos de busca estão desperdiçando verba?',
  'Escreva 3 textos de anúncio para o meu projeto principal e salve como rascunho.',
];

/** Negrito, itálico e listas simples — o suficiente para as respostas do Copiloto. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : part.startsWith('_') && part.endsWith('_') && part.length > 2 ? (
      <em key={i}>{part.slice(1, -1)}</em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="selectable flex flex-col gap-2 text-sm leading-relaxed">
      {blocks.map((b, i) => {
        const lines = b.split('\n');
        if (lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))) {
          const ordered = /^\s*\d/.test(lines[0]!);
          const items = lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ''))}</li>);
          return ordered ? (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {items}
            </ol>
          ) : (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {items}
            </ul>
          );
        }
        if (/^#{1,3}\s/.test(b)) return <p key={i} className="font-semibold">{inline(b.replace(/^#{1,3}\s/, ''))}</p>;
        return (
          <p key={i} className="whitespace-pre-wrap">
            {inline(b)}
          </p>
        );
      })}
    </div>
  );
}

export function CopilotPage() {
  const organizationId = useOrgId();
  const { org } = useOrg();
  const qc = useQueryClient();
  const toast = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const ai = useQuery({ queryKey: ['ai-config'], queryFn: () => api('ai.getConfig') });
  const list = useQuery({ queryKey: ['copilot', organizationId], queryFn: () => api('copilot.list', { organizationId }) });
  const conv = useQuery({ queryKey: ['copilot', organizationId, activeId], queryFn: () => api('copilot.get', { organizationId, id: activeId! }), enabled: !!activeId });

  const send = useMutation({
    mutationFn: (text: string) => api('copilot.send', { organizationId, conversationId: activeId, text }),
    onMutate: (text) => setPending(text),
    onSuccess: async (c) => {
      setPending(null);
      qc.setQueryData(['copilot', organizationId, c.id], c);
      setActiveId(c.id);
      await qc.invalidateQueries({ queryKey: ['copilot', organizationId], exact: true });
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
      await qc.invalidateQueries({ queryKey: ['creatives'] });
    },
    onError: (e) => {
      setPending(null);
      toast.error(e);
    },
  });
  const resolve = useMutation({
    mutationFn: ({ p, decision }: { p: CopilotProposal; decision: 'confirm' | 'dismiss' }) =>
      api('copilot.resolve', { organizationId, conversationId: activeId!, proposalId: p.id, decision }),
    onSuccess: async (c) => {
      qc.setQueryData(['copilot', organizationId, c.id], c);
      const failed = c.messages.flatMap((m) => m.proposals).find((p) => p.status === 'failed' && p.error);
      if (failed) toast.error(failed.error);
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (e) => toast.error(e),
  });
  const del = useMutation({
    mutationFn: (id: string) => api('copilot.delete', { organizationId, id }),
    onSuccess: async () => {
      setActiveId(null);
      await qc.invalidateQueries({ queryKey: ['copilot', organizationId], exact: true });
    },
    onError: (e) => toast.error(e),
  });

  const messages: CopilotMessage[] = activeId ? (conv.data?.messages ?? []) : [];
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, pending]);

  const submit = (text = draft) => {
    const t = text.trim();
    if (!t || send.isPending) return;
    setDraft('');
    send.mutate(t);
  };
  const noKey = ai.data && !ai.data.hasApiKey;

  return (
    <>
      <PageHeader
        title="Copiloto"
        description="Converse com as suas contas: pergunte, peça análises, textos e rascunhos. O Copiloto consulta os dados reais e só mexe nas plataformas quando você confirma."
      />
      {noKey && (
        <Notice tone="warning" title="Configure o provedor de IA">
          O Copiloto usa a sua chave da Anthropic. Configure em{' '}
          <Link to="/configuracoes" className="text-[#b9a8ff] underline">
            Configurações → Provedor de IA
          </Link>
          .
        </Notice>
      )}
      <div className="mt-4 grid min-h-[60vh] gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="flex flex-col overflow-hidden">
          <div className="border-b border-border p-3">
            <Button className="w-full" variant="outline" icon={<MessageSquarePlus className="size-4" />} onClick={() => setActiveId(null)}>
              Nova conversa
            </Button>
          </div>
          <ul className="flex-1 overflow-y-auto p-2" aria-label="Conversas">
            {list.data?.length === 0 && <li className="p-2 text-xs text-subtle">Nenhuma conversa ainda.</li>}
            {list.data?.map((c) => (
              <li key={c.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={cn('flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-3', activeId === c.id && 'bg-surface-3 text-fg')}
                  title={`${c.title} · ${formatDateTime(c.updatedAt)}`}
                >
                  {c.title}
                </button>
                <button type="button" aria-label={`Excluir conversa ${c.title}`} className="invisible rounded p-1 text-subtle hover:text-danger group-hover:visible" onClick={() => del.mutate(c.id)}>
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex min-h-[60vh] flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-5" aria-live="polite">
            {messages.length === 0 && !pending && (
              <div className="mx-auto max-w-xl py-8 text-center">
                <Bot className="mx-auto size-8 text-[#b9a8ff]" />
                <p className="mt-3 font-medium">Como posso ajudar com os seus anúncios?</p>
                <p className="mt-1 text-sm text-muted">{org?.isDemo ? 'Organização de demonstração: os números são fictícios.' : 'Eu consulto as métricas, o Cérebro criativo, o Piloto e os briefings antes de responder.'}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" disabled={!!noKey} onClick={() => submit(s)} className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:border-[#8b6cff] hover:text-fg disabled:opacity-50">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <MessageView key={m.id} m={m} busy={resolve.isPending} onResolve={(p, decision) => resolve.mutate({ p, decision })} />
            ))}
            {pending && (
              <>
                <MessageView m={{ id: 'pending', role: 'user', text: pending, steps: [], proposals: [], createdAt: '' }} busy onResolve={() => undefined} />
                <div className="flex items-center gap-3 text-sm text-muted">
                  <Bot className="size-5 animate-pulse text-[#b9a8ff]" />
                  Pensando e consultando os seus dados…
                </div>
              </>
            )}
            <div ref={endRef} />
          </div>
          <form
            className="flex items-end gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <Textarea
              aria-label="Mensagem para o Copiloto"
              rows={2}
              maxLength={4000}
              value={draft}
              disabled={!!noKey}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Pergunte algo… (Enter envia, Shift+Enter quebra linha)"
              className="flex-1 resize-none"
            />
            <Button type="submit" icon={<Send className="size-4" />} loading={send.isPending} disabled={!draft.trim() || !!noKey}>
              Enviar
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}

const KIND_LABEL: Record<CopilotProposal['kind'], string> = { pause_campaign: 'Pausar campanha', activate_campaign: 'Ativar campanha', set_budget: 'Alterar orçamento diário' };

function MessageView({ m, busy, onResolve }: { m: CopilotMessage; busy: boolean; onResolve: (p: CopilotProposal, d: 'confirm' | 'dismiss') => void }) {
  const isUser = m.role === 'user';
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', isUser ? 'bg-surface-3' : 'bg-brand-soft')}>
        {isUser ? <User className="size-4" /> : <Bot className="size-4 text-[#b9a8ff]" />}
      </div>
      <div className={cn('flex max-w-[80%] flex-col gap-2', isUser && 'items-end')}>
        {m.steps.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {m.steps.map((s, i) => (
              <Badge key={i} tone={s.ok ? 'neutral' : 'warning'}>
                {s.ok ? <Check className="size-3" /> : <CircleAlert className="size-3" />} {s.label}
                {s.summary ? ` · ${s.summary}` : ''}
              </Badge>
            ))}
          </div>
        )}
        <div className={cn('rounded-xl px-4 py-3', isUser ? 'bg-surface-3' : 'border border-border bg-surface-2')}>
          {isUser ? <p className="selectable whitespace-pre-wrap text-sm">{m.text}</p> : <RichText text={m.text} />}
        </div>
        {m.proposals.map((p) => (
          <div key={p.id} className="w-full rounded-xl border border-warning/40 bg-warning/5 p-3 text-sm">
            <p className="font-medium">
              {KIND_LABEL[p.kind]}: {p.campaignName}
              {p.kind === 'set_budget' && p.value !== null && ` → ${formatCurrency(p.value, p.currency)}/dia`}
            </p>
            <p className="mt-1 text-xs text-muted">{p.reason}</p>
            <div className="mt-2 flex items-center gap-2">
              {p.status === 'pending' ? (
                <>
                  <Button size="sm" icon={<CheckCircle2 className="size-3.5" />} loading={busy} onClick={() => onResolve(p, 'confirm')}>
                    Confirmar e aplicar
                  </Button>
                  <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} disabled={busy} onClick={() => onResolve(p, 'dismiss')}>
                    Descartar
                  </Button>
                </>
              ) : (
                <Badge tone={p.status === 'done' ? 'success' : p.status === 'failed' ? 'danger' : 'neutral'}>
                  {p.status === 'done' ? 'Aplicado na plataforma' : p.status === 'failed' ? `Falhou: ${p.error ?? ''}` : 'Descartado'}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

