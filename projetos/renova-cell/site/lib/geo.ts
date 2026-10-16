'use client';

import { isLocale, localeFromLanguageTag, type Locale } from './i18n';

/**
 * Locale resolution, in order:
 *  1. a language the visitor picked before (persisted store),
 *  2. the IP-based locale the middleware put in the `rc_locale` cookie,
 *  3. navigator.language,
 *  4. /api/geo (IP lookup) as a last resort when no cookie came through (e.g. static cache).
 */
export async function resolveLocale(persisted: { locale: Locale; localeChosen: boolean }): Promise<Locale> {
  if (persisted.localeChosen) return persisted.locale;

  const cookie = document.cookie.match(/(?:^|; )rc_locale=([^;]+)/)?.[1];
  if (isLocale(cookie)) return cookie;

  const fromBrowser = localeFromLanguageTag(navigator.language);
  if (fromBrowser) return fromBrowser;

  try {
    const res = await fetch('/api/geo');
    const data = (await res.json()) as { locale?: string };
    if (isLocale(data.locale)) return data.locale;
  } catch {
    // offline or blocked — fall through to the persisted default
  }
  return persisted.locale;
}
