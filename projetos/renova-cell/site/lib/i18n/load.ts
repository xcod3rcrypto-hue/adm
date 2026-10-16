'use client';

/**
 * Loads one dictionary on demand, so each visitor downloads only their own language.
 * Each import() becomes its own chunk.
 */
import { en, type Dictionary } from './en';
import type { Locale } from './index';

const loaders: Partial<Record<Locale, () => Promise<Dictionary>>> = {
  en: async () => en,
  pt: () => import('./pt').then((m) => m.pt),
  es: () => import('./es').then((m) => m.es),
  fr: () => import('./fr').then((m) => m.fr),
  de: () => import('./de').then((m) => m.de),
};

const cache = new Map<Locale, Dictionary>([['en', en]]);

export async function loadDictionary(locale: Locale): Promise<Dictionary> {
  const cached = cache.get(locale);
  if (cached) return cached;
  const dict = (await loaders[locale]?.()) ?? en;
  cache.set(locale, dict);
  return dict;
}

export function cachedDictionary(locale: Locale): Dictionary | undefined {
  return cache.get(locale);
}

export function primeDictionary(locale: Locale, dict: Dictionary): void {
  cache.set(locale, dict);
}
