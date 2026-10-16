'use client';

import { useEffect, type ReactNode } from 'react';
import { resolveLocale } from '@/lib/geo';
import { InitialLocaleContext } from '@/lib/hooks';
import type { Locale } from '@/lib/i18n';
import { useFunnel } from '@/lib/store';

/**
 * Loads the persisted funnel state after mount (avoids hydration mismatches),
 * then resolves the locale: chosen language → IP cookie → browser → /api/geo.
 */
export function Providers({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  useEffect(() => {
    void (async () => {
      await useFunnel.persist.rehydrate();
      const { locale, localeChosen, setLocale } = useFunnel.getState();
      const resolved = await resolveLocale({ locale, localeChosen });
      setLocale(resolved);
      document.documentElement.lang = resolved;
    })();
  }, []);

  return <InitialLocaleContext.Provider value={initialLocale}>{children}</InitialLocaleContext.Provider>;
}
