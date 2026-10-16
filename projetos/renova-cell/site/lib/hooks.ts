'use client';

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { readCookie } from './browser';
import { format, getDictionary, type Locale } from './i18n';
import { money, type Currency } from './products';
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

/**
 * Currency for this visitor, decided on the server from the IP country (middleware → layout)
 * so server and client render the same prices.
 */
export const CurrencyContext = createContext<Currency>('usd');

export function useCurrency(): Currency {
  return useContext(CurrencyContext);
}

export function useT() {
  const locale = useLocale();
  const currency = useCurrency();
  /** Formats cents in the visitor's currency and language, e.g. 2990 → "29,90 €" or "$29.90". */
  const m = (cents: number) => money(cents, locale, currency);
  return { locale, currency, d: getDictionary(locale), f: format, m };
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
    if (readCookie('rc_ab') === 'B') setVariant('B');
  }, []);
  return variant;
}
