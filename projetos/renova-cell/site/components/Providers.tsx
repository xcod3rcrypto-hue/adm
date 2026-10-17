'use client';

import { MotionConfig } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { resolveLocale } from '@/lib/geo';
import { attributionFromSearch } from '@/lib/attribution';
import { CurrencyContext, DictionaryContext, InitialLocaleContext, MarketContext, useHydrated, type Market } from '@/lib/hooks';
import { htmlLang, type Dictionary, type Locale } from '@/lib/i18n';
import { en } from '@/lib/i18n/en';
import { cachedDictionary, loadDictionary, primeDictionary } from '@/lib/i18n/load';
import { adSafeDictionary } from '@/lib/i18n/neutral';
import type { Currency } from '@/lib/products';
import { useFunnel } from '@/lib/store';

/**
 * - Loads the persisted funnel state after mount (avoids hydration mismatches), then resolves
 *   the locale: chosen language → phone language → IP cookie → /api/geo.
 * - Keeps the dictionary for the active locale. The server sends the first one with the page;
 *   any other language is fetched on demand, so nobody downloads all 28.
 * - Provides the currency and market facts (delivery promise, ad-safe copy) the server picked.
 * - Stores the ad-click attribution (UTMs, fbclid) of the landing URL.
 */
const DEFAULT_MARKET: Market = { fastDelivery: true, adSafe: false };

export function Providers({
  initialLocale,
  initialDictionary,
  currency = 'usd',
  market = DEFAULT_MARKET,
  children,
}: {
  initialLocale: Locale;
  initialDictionary?: Dictionary;
  currency?: Currency;
  market?: Market;
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
      // A new ad click replaces the stored attribution (last paid click wins).
      const attribution = attributionFromSearch(window.location.search);
      if (attribution) useFunnel.getState().setAttribution(attribution);
      const { locale, localeChosen, setLocale } = useFunnel.getState();
      setLocale(await resolveLocale({ locale, localeChosen }));
    })();
  }, []);

  useEffect(() => {
    document.documentElement.lang = htmlLang(active);
    if (loaded.locale === active) return;
    let alive = true;
    void loadDictionary(active).then((d) => alive && setLoaded({ locale: active, d: market.adSafe ? adSafeDictionary(d) : d }));
    return () => {
      alive = false;
    };
  }, [active, loaded.locale, market.adSafe]);

  return (
    <InitialLocaleContext.Provider value={initialLocale}>
      <CurrencyContext.Provider value={currency}>
        <MarketContext.Provider value={market}>
        <DictionaryContext.Provider value={loaded.d}>
          {/* Visitors who ask for reduced motion get every movement (slides, flips, entrances) instantly. */}
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </DictionaryContext.Provider>
        </MarketContext.Provider>
      </CurrencyContext.Provider>
    </InitialLocaleContext.Provider>
  );
}
