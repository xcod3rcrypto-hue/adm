import { createContext, useContext, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Organization } from '@advertex/shared';
import { api } from './api';

interface OrgState {
  org: Organization | null;
  orgs: Organization[];
  isLoading: boolean;
  error: unknown;
  switchTo: (id: string) => Promise<void>;
}

const OrgContext = createContext<OrgState | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const active = useQuery({ queryKey: ['org', 'active'], queryFn: () => api('org.getActive') });
  const list = useQuery({ queryKey: ['org', 'list'], queryFn: () => api('org.list') });
  const switchMut = useMutation({
    mutationFn: (organizationId: string) => api('org.setActive', { organizationId }),
    onSuccess: async () => {
      // Troca de organização invalida todo o cache: nenhum dado de outra org permanece na tela.
      await qc.invalidateQueries();
    },
  });

  return (
    <OrgContext.Provider
      value={{
        org: active.data ?? null,
        orgs: list.data ?? [],
        isLoading: active.isLoading || list.isLoading,
        error: active.error ?? list.error,
        switchTo: async (id) => {
          await switchMut.mutateAsync(id);
        },
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg(): OrgState {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg fora do OrgProvider');
  return ctx;
}

/** Organização ativa garantida (as páginas só renderizam após o onboarding). */
export function useOrgId(): string {
  const { org } = useOrg();
  if (!org) throw new Error('Nenhuma organização ativa');
  return org.id;
}
