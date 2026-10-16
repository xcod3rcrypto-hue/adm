/**
 * Demo stand-in for `next/navigation`: an in-memory router whose path is mirrored
 * to a plain #token in the URL (the only kind of hash an artifact link carries).
 */
import { useMemo, useSyncExternalStore } from 'react';

interface Loc {
  pathname: string;
  search: string;
}

const ROUTES = ['quiz', 'analyzing', 'offer', 'checkout', 'upsell-1', 'upsell-2', 'thank-you', 'privacy', 'terms'];

function fromHash(): Loc {
  let token = '';
  try {
    token = window.location.hash.replace(/^#/, '');
  } catch {
    // ignore
  }
  return { pathname: ROUTES.includes(token) ? `/${token}` : '/quiz', search: '' };
}

let current: Loc = fromHash();
const listeners = new Set<() => void>();

export function navigate(url: string): void {
  const u = new URL(url, 'https://demo.local');
  current = { pathname: u.pathname === '/' ? '/quiz' : u.pathname, search: u.search };
  try {
    history.replaceState(null, '', `#${current.pathname.slice(1)}`);
  } catch {
    // history blocked in some frames — the in-memory route still works
  }
  window.scrollTo(0, 0);
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function useLocation(): Loc {
  return useSyncExternalStore(subscribe, () => current, () => current);
}

const router = {
  push: (url: string) => navigate(url),
  replace: (url: string) => navigate(url),
  back: () => navigate('/quiz'),
  forward: () => undefined,
  refresh: () => undefined,
  prefetch: () => undefined,
};

export function useRouter() {
  return router;
}

export function usePathname(): string {
  return useLocation().pathname;
}

export function useSearchParams(): URLSearchParams {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function redirect(url: string): never {
  navigate(url);
  throw new Error('redirect');
}
