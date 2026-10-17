'use client';

import { MotionConfig } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { resolveLocale } from '@/lib/geo';
import { CurrencyContext, DictionaryContext, InitialLocaleContext, useHydrated } from '@/lib/hooks';
import { htmlLang, type Dictionary, type Locale } from '@/lib/i18n';
import { en } from '@/lib/i18n/en';
import { cachedDictionary, loadDictionary, primeDictionary } from '@/lib/i18n/load';
import type { Currency } from '@/lib/products';
import { useFunnel } from '@/lib/store';

/**
 * - Loads the persisted funnel state after mount (avoids hydration mismatches), then resolves
 *   the locale: chosen language → phone language → IP cookie → /api/geo.
 * - Keeps the dictionary for the active locale. The server sends the first one with the page;
 *   any other language is fetched on demand, so nobody downloads all 28.
 * - Provides the currency the server picked from the visitor's country.
 */
export function Providers({
  initialLocale,
  initialDictionary,
  currency = 'usd',
  children,
}: {
  initialLocale: Locale;
  initialDictionary?: Dictionary;
  currency?: Currency;
  children: ReactNode;
}) {
  const hydrated = useHydrated();
  const stored = useFunnel((s) => s.locale);
  const active = hydrated ? stored : initialLocale;
  const [loaded, setLoaded] = useState(() => {
    if (initialDictionary) primeDictionary(initialLocale, initialDictionary);
    return { locale: initialLocale, d: initialDictionary ?? cachedDictionary(initialLocale) ?? en };
  });

  useEffect(() => {
    void (async () => {
      await useFunnel.persist.rehydrate();
      const { locale, localeChosen, setLocale } = useFunnel.getState();
      setLocale(await resolveLocale({ locale, localeChosen }));
    })();
  }, []);

  useEffect(() => {
    document.documentElement.lang = htmlLang(active);
    if (loaded.locale === active) return;
    let alive = true;
    void loadDictionary(active).then((d) => alive && setLoaded({ locale: active, d }));
    return () => {
      alive = false;
    };
  }, [active, loaded.locale]);

  return (
    <InitialLocaleContext.Provider value={initialLocale}>
      <CurrencyContext.Provider value={currency}>
        <DictionaryContext.Provider value={loaded.d}>
          {/* Visitors who ask for reduced motion get every movement (slides, flips, entrances) instantly. */}
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </DictionaryContext.Provider>
      </CurrencyContext.Provider>
    </InitialLocaleContext.Provider>
  );
}
