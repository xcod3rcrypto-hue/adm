import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Beaker, Brain, CalendarDays, Radar, FileBarChart, Workflow, Building2, HardDrive, FolderKanban, Images, LayoutDashboard, Megaphone, PlugZap, Settings, Sparkles } from 'lucide-react';
import { cn } from '../lib/cn';
import { useOrg } from '../lib/org';
import { useToast } from './ui';
import { Logo } from './Logo';
import { UpdateBanner } from './UpdateBanner';

const NAV = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/projetos', label: 'Projetos', icon: FolderKanban },
  { to: '/estudio', label: 'Estúdio de IA', icon: Sparkles },
  { to: '/criativos', label: 'Criativos', icon: Images },
  { to: '/campanhas', label: 'Campanhas', icon: Megaphone },
  { to: '/inteligencia', label: 'Inteligência', icon: Brain },
  { to: '/concorrentes', label: 'Concorrentes', icon: Radar },
  { to: '/experimentos', label: 'Experimentos', icon: Beaker },
  { to: '/automacoes', label: 'Automações', icon: Workflow },
  { to: '/relatorios', label: 'Relatórios', icon: FileBarChart },
  { to: '/calendario', label: 'Calendário', icon: CalendarDays },
  { to: '/integracoes', label: 'Integrações', icon: PlugZap },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const { org, orgs, switchTo } = useOrg();
  const info = useQuery({ queryKey: ['app-info'], queryFn: () => api('app.getInfo'), staleTime: Infinity });
  const unread = useQuery({
    queryKey: ['notifications-unread', org?.id],
    queryFn: () => api('notification.unread', { organizationId: org!.id }),
    enabled: !!org,
    refetchInterval: 60_000,
  });
  const toast = useToast();
  const navigate = useNavigate();

  return (
    <div className="flex h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface/80">
        <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
          <Logo className="size-8" />
          <div className="leading-tight">
            <p className="font-display text-[15px] font-bold tracking-wide">ADVERTEX</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gradient">AI Studio</p>
          </div>
        </div>

        <div className="px-3 pb-3">
          <label htmlFor="org-switch" className="mb-1 flex items-center gap-1.5 px-2 text-[11px] font-medium uppercase tracking-wide text-subtle">
            <Building2 className="size-3" /> Organização
          </label>
          <select
            id="org-switch"
            value={org?.id ?? ''}
            onChange={(e) => {
              if (e.target.value === '__new') {
                navigate('/boas-vindas');
                return;
              }
              switchTo(e.target.value)
                .then(() => navigate('/'))
                .catch((err: unknown) => toast.error(err));
            }}
            className="h-9 w-full rounded-lg border border-border bg-surface-2 px-2 text-sm focus:border-brand focus:outline-none"
          >
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
            <option value="__new">+ Nova organização…</option>
          </select>
        </div>

        <nav aria-label="Navegação principal" className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-brand-soft text-fg' : 'text-muted hover:bg-surface-3 hover:text-fg',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('size-4', isActive ? 'text-[#b9a8ff]' : 'text-subtle group-hover:text-muted')} aria-hidden />
                  {label}
                  {to === '/automacoes' && !!unread.data && (
                    <span className="ml-auto rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white" aria-label={`${unread.data} alertas não lidos`}>
                      {unread.data}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <p className="flex items-center gap-1.5 px-5 py-4 text-[11px] text-subtle">
          <HardDrive className="size-3" aria-hidden /> Dados salvos neste computador{info.data && ` · v${info.data.version}`}
        </p>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <UpdateBanner />
        {org?.isDemo && (
          <div role="status" className="flex items-center justify-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-1.5 text-xs font-medium text-warning">
            MODO DEMONSTRAÇÃO — todos os dados desta organização são fictícios e não representam resultados reais.
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1280px] px-8 py-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
