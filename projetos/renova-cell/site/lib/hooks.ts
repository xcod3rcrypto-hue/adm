'use client';

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { format, getDictionary, type Locale } from './i18n';
import { useFunnel } from './store';

/** true once the persisted funnel state has been loaded from localStorage. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useFunnel.persist.onFinishHydration(cb),
    () => useFunnel.persist.hasHydrated(),
    () => false,
  );
}

export const InitialLocaleContext = createContext<Locale>('en');

/** Server-safe locale: the request locale until the store hydrates, then the store's. */
export function useLocale(): Locale {
  const initial = useContext(InitialLocaleContext);
  const hydrated = useHydrated();
  const stored = useFunnel((s) => s.locale);
  return hydrated ? stored : initial;
}

export function useT() {
  const locale = useLocale();
  return { locale, d: getDictionary(locale), f: format };
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** The A/B bucket assigned by middleware. */
export function useVariant(): 'A' | 'B' {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  useEffect(() => {
    if (/(?:^|; )rc_ab=B/.test(document.cookie)) setVariant('B');
  }, []);
  return variant;
}
