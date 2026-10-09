import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Building2, FlaskConical, FolderKanban, Images, LayoutDashboard, Megaphone, PlugZap, Settings, Sparkles } from 'lucide-react';
import { cn } from '../lib/cn';
import { useOrg } from '../lib/org';
import { useToast } from './ui';
import { Logo } from './Logo';

const NAV = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/projetos', label: 'Projetos', icon: FolderKanban },
  { to: '/estudio', label: 'Estúdio de IA', icon: Sparkles },
  { to: '/criativos', label: 'Criativos', icon: Images },
  { to: '/campanhas', label: 'Campanhas', icon: Megaphone },
  { to: '/integracoes', label: 'Integrações', icon: PlugZap },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const { org, orgs, switchTo } = useOrg();
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

        <nav aria-label="Navegação principal" className="flex flex-1 flex-col gap-0.5 px-3">
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
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 rounded-xl border border-border bg-surface-2 p-3 text-xs text-muted">
          <p className="flex items-center gap-1.5 font-medium text-fg">
            <FlaskConical className="size-3.5 text-accent" /> Fase 1 — Fundação
          </p>
          <p className="mt-1 leading-relaxed">Inteligência, experimentos, automações e relatórios chegam nas próximas fases (ver docs/ROADMAP.md).</p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
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
