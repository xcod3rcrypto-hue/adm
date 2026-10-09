import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, FlaskConical, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { Button, Card, Field, Input, Notice, Textarea, useToast } from '../components/ui';
import { Logo } from '../components/Logo';

/**
 * Primeira execução: cria a organização e (opcionalmente) o primeiro projeto.
 * Também usada para criar organizações adicionais (modo `embedded`).
 */
export function OnboardingPage({ embedded = false }: { embedded?: boolean }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();
  const [orgName, setOrgName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [objective, setObjective] = useState('');
  const [busy, setBusy] = useState<'create' | 'demo' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setError(null);
    if (orgName.trim().length < 2) {
      setError('Informe o nome da organização (mínimo 2 caracteres).');
      return;
    }
    setBusy('create');
    try {
      const org = await api('org.create', { name: orgName.trim() });
      let target = '/';
      if (projectName.trim().length >= 2) {
        const p = await api('project.create', { organizationId: org.id, data: { name: projectName.trim(), objective: objective.trim() } });
        target = `/projetos/${p.id}`;
      }
      await qc.invalidateQueries();
      navigate(target);
      toast.success('Organização criada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const demo = async () => {
    setBusy('demo');
    try {
      await api('demo.enable');
      await qc.invalidateQueries();
      navigate('/');
    } catch (err) {
      toast.error(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={embedded ? '' : 'flex min-h-full items-center justify-center bg-[radial-gradient(ellipse_at_top,rgba(124,92,255,0.18),transparent_60%)] p-8'}>
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col justify-center">
          <Logo className="mb-6 size-14" />
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            {embedded ? 'Nova organização' : (
              <>
                Bem-vindo ao <span className="text-gradient">ADVERTEX AI Studio</span>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-md text-base text-muted">
            Entenda o negócio, crie anúncios com IA, conecte Meta Ads e Google Ads e acompanhe resultados reais — tudo em um só lugar.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-[#b9a8ff]" />
              <span className="text-muted">
                <b className="text-fg">Funciona localmente sem integrações.</b> Projetos, briefings e criativos ficam salvos neste computador.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
              <span className="text-muted">
                <b className="text-fg">Credenciais protegidas.</b> Chaves e tokens são cifrados pelo Windows e nunca saem do processo principal.
              </span>
            </li>
            <li className="flex gap-3">
              <FlaskConical className="mt-0.5 size-5 shrink-0 text-warning" />
              <span className="text-muted">
                <b className="text-fg">Modo demonstração separado.</b> Explore com dados fictícios, claramente identificados, sem misturar com dados reais.
              </span>
            </li>
          </ul>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">{embedded ? 'Dados da organização' : 'Vamos começar'}</h2>
          <p className="mt-1 text-sm text-muted">Crie sua organização e, se quiser, o primeiro projeto.</p>
          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
          >
            <Field label="Nome da organização" htmlFor="org-name" required hint="Sua agência, empresa ou marca.">
              <Input id="org-name" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Ex.: Agência Horizonte" maxLength={120} autoFocus />
            </Field>
            <div className="my-1 h-px bg-border" />
            <Field label="Primeiro projeto (opcional)" htmlFor="project-name">
              <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Ex.: Lançamento coleção verão" maxLength={120} />
            </Field>
            <Field label="Objetivo do projeto" htmlFor="project-objective">
              <Textarea id="project-objective" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ex.: gerar 300 leads qualificados por mês com CPA até R$ 40" maxLength={500} />
            </Field>
            {error && <Notice tone="danger">{error}</Notice>}
            <Button type="submit" loading={busy === 'create'} disabled={busy !== null} icon={<ArrowRight className="size-4" />}>
              Criar e continuar
            </Button>
          </form>
          {!embedded && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="text-sm text-muted">Prefere conhecer antes?</p>
              <Button variant="outline" className="mt-2 w-full" loading={busy === 'demo'} disabled={busy !== null} onClick={() => void demo()} icon={<FlaskConical className="size-4" />}>
                Explorar modo demonstração (dados fictícios)
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
