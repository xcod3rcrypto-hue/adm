import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { ToastProvider } from './components/ui';
import { OrgProvider } from './lib/org';
import { ApiError } from './lib/api';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 15_000,
      // Erros de validação/configuração não melhoram com retentativa.
      retry: (count, err) => count < 1 && !(err instanceof ApiError && err.code !== 'NETWORK' && err.code !== 'INTERNAL'),
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <HashRouter>
          <OrgProvider>
            <App />
          </OrgProvider>
        </HashRouter>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
