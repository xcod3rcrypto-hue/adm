'use client';

/**
 * Loads one dictionary on demand, so each visitor downloads only their own language.
 * Each import() becomes its own chunk.
 */
import { en, type Dictionary } from './en';
import type { Locale } from './index';

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: async () => en,
  pt: () => import('./pt').then((m) => m.pt),
  es: () => import('./es').then((m) => m.es),
  fr: () => import('./fr').then((m) => m.fr),
  de: () => import('./de').then((m) => m.de),
  it: () => import('./it').then((m) => m.it),
  nl: () => import('./nl').then((m) => m.nl),
  pl: () => import('./pl').then((m) => m.pl),
  sv: () => import('./sv').then((m) => m.sv),
  da: () => import('./da').then((m) => m.da),
  nb: () => import('./nb').then((m) => m.nb),
  fi: () => import('./fi').then((m) => m.fi),
  et: () => import('./et').then((m) => m.et),
  is: () => import('./is').then((m) => m.is),
  cs: () => import('./cs').then((m) => m.cs),
  sk: () => import('./sk').then((m) => m.sk),
  hu: () => import('./hu').then((m) => m.hu),
  ro: () => import('./ro').then((m) => m.ro),
  bg: () => import('./bg').then((m) => m.bg),
  uk: () => import('./uk').then((m) => m.uk),
  el: () => import('./el').then((m) => m.el),
  lt: () => import('./lt').then((m) => m.lt),
  lv: () => import('./lv').then((m) => m.lv),
  hr: () => import('./hr').then((m) => m.hr),
  sl: () => import('./sl').then((m) => m.sl),
  sr: () => import('./sr').then((m) => m.sr),
  sq: () => import('./sq').then((m) => m.sq),
  mk: () => import('./mk').then((m) => m.mk),
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
