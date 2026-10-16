'use client';

import { readCookie } from './browser';
import { isLocale, localeFromLanguageList, type Locale } from './i18n';

/**
 * Locale resolution, in order:
 *  1. a language the visitor picked in the footer (persisted store),
 *  2. the phone/browser language (navigator.languages, first supported one),
 *  3. the IP-based locale the middleware put in the `rc_locale` cookie,
 *  4. /api/geo (IP lookup) when no cookie came through (e.g. a cached page),
 *  5. the persisted default.
 */
export async function resolveLocale(persisted: { locale: Locale; localeChosen: boolean }): Promise<Locale> {
  if (persisted.localeChosen) return persisted.locale;

  let languages: readonly string[] = [];
  try {
    languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  } catch {
    // navigator unavailable
  }
  const fromPhone = localeFromLanguageList(languages);
  if (fromPhone) return fromPhone;

  const cookie = readCookie('rc_locale');
  if (isLocale(cookie)) return cookie;

  try {
    const res = await fetch('/api/geo');
    const data = (await res.json()) as { locale?: string };
    if (isLocale(data.locale)) return data.locale;
  } catch {
    // offline or blocked — fall through to the persisted default
  }
  return persisted.locale;
}
