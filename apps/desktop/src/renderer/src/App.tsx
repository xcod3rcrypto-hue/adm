import { Navigate, Route, Routes } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { ErrorState, LoadingState } from './components/ui';
import { api } from './lib/api';
import { useOrg } from './lib/org';
import { OnboardingPage } from './pages/Onboarding';
import { DashboardPage } from './pages/Dashboard';
import { ProjectsPage } from './pages/Projects';
import { ProjectDetailPage } from './pages/ProjectDetail';
import { StudioPage } from './pages/Studio';
import { CreativesPage } from './pages/Creatives';
import { CampaignsPage } from './pages/Campaigns';
import { IntegrationsPage } from './pages/Integrations';
import { SettingsPage } from './pages/Settings';
import { IntelligencePage } from './pages/Intelligence';

export function App() {
  const { org, isLoading, error } = useOrg();
  const onboarding = useQuery({ queryKey: ['onboarding', org?.id ?? null], queryFn: () => api('onboarding.getState', { organizationId: org?.id ?? null }) });

  if (isLoading || onboarding.isLoading) {
    return (
      <div className="mx-auto max-w-xl p-10">
        <LoadingState label="Iniciando ADVERTEX AI Studio…" />
      </div>
    );
  }
  if (error || onboarding.error) {
    return (
      <div className="mx-auto max-w-xl p-10">
        <ErrorState error={error ?? onboarding.error} onRetry={() => location.reload()} title="Falha ao iniciar" />
      </div>
    );
  }
  // Primeira execução (ou somente a organização demo existe e nenhuma está ativa).
  if (!org) return <OnboardingPage />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/projetos/:id" element={<ProjectDetailPage />} />
        <Route path="/estudio" element={<StudioPage />} />
        <Route path="/criativos" element={<CreativesPage />} />
        <Route path="/campanhas" element={<CampaignsPage />} />
        <Route path="/inteligencia" element={<IntelligencePage />} />
        <Route path="/integracoes" element={<IntegrationsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route path="/boas-vindas" element={<OnboardingPage embedded />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
