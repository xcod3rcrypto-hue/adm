import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { Button, useToast } from './ui';

/** Faixa no topo do app quando há uma versão nova: baixar e reiniciar com um clique. */
export function UpdateBanner() {
  const qc = useQueryClient();
  const toast = useToast();
  const state = useQuery({
    queryKey: ['update'],
    queryFn: () => api('app.updateStatus'),
    refetchInterval: (q) => (q.state.data?.status === 'downloading' ? 1000 : 60_000),
  });
  const download = useMutation({
    mutationFn: () => api('app.downloadUpdate'),
    onSuccess: (s) => qc.setQueryData(['update'], s),
    onError: (e) => toast.error(e),
  });
  const install = useMutation({ mutationFn: () => api('app.installUpdate'), onError: (e) => toast.error(e) });

  const s = state.data;
  if (!s || !['available', 'downloading', 'downloaded'].includes(s.status)) return null;

  return (
    <div role="status" className="flex flex-wrap items-center justify-center gap-3 border-b border-brand/40 bg-brand-soft px-4 py-2 text-sm">
      <Sparkles className="size-4 text-[#b9a8ff]" aria-hidden />
      {s.status === 'available' && (
        <>
          <span>
            Nova versão <b>{s.availableVersion}</b> disponível (você está na {s.currentVersion}).
          </span>
          <Button size="sm" icon={<Download className="size-3.5" />} loading={download.isPending} onClick={() => download.mutate()}>
            Atualizar
          </Button>
        </>
      )}
      {s.status === 'downloading' && (
        <span className="flex items-center gap-2">
          Baixando a versão {s.availableVersion}… {s.progress ?? 0}%
          <span className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-3" aria-hidden>
            <span className="block h-full bg-brand transition-all" style={{ width: `${s.progress ?? 0}%` }} />
          </span>
        </span>
      )}
      {s.status === 'downloaded' && (
        <>
          <span>
            Versão <b>{s.availableVersion}</b> pronta. O app vai fechar, instalar e abrir de novo — seus dados são mantidos.
          </span>
          <Button size="sm" icon={<RefreshCw className="size-3.5" />} loading={install.isPending} onClick={() => install.mutate()}>
            Reiniciar e atualizar
          </Button>
        </>
      )}
    </div>
  );
}
