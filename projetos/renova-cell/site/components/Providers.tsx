'use client';

import { useEffect, type ReactNode } from 'react';
import { resolveLocale } from '@/lib/geo';
import { CurrencyContext, InitialLocaleContext } from '@/lib/hooks';
import type { Locale } from '@/lib/i18n';
import type { Currency } from '@/lib/products';
import { useFunnel } from '@/lib/store';

/**
 * Loads the persisted funnel state after mount (avoids hydration mismatches),
 * then resolves the locale: chosen language → IP cookie → browser → /api/geo.
 */
export function Providers({
  initialLocale,
  currency = 'usd',
  children,
}: {
  initialLocale: Locale;
  currency?: Currency;
  children: ReactNode;
}) {
  useEffect(() => {
    void (async () => {
      await useFunnel.persist.rehydrate();
      const { locale, localeChosen, setLocale } = useFunnel.getState();
      const resolved = await resolveLocale({ locale, localeChosen });
      setLocale(resolved);
      document.documentElement.lang = resolved;
    })();
  }, []);

  return (
    <InitialLocaleContext.Provider value={initialLocale}>
      <CurrencyContext.Provider value={currency}>{children}</CurrencyContext.Provider>
    </InitialLocaleContext.Provider>
  );
}
