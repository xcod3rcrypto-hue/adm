import { de } from './de';
import { en, type Dictionary } from './en';
import { es } from './es';
import { fr } from './fr';
import { pt } from './pt';

export const LOCALES = ['en', 'pt', 'es', 'fr', 'de'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
};

const dictionaries: Record<Locale, Dictionary> = { en, pt, es, fr, de };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

/** Replaces `{name}` placeholders. Missing variables are left empty. */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => (key in vars ? String(vars[key]) : ''));
}

/**
 * t('pt', 'offer.trust', { name: 'Ana' }) — dotted-path lookup with fallback to English,
 * then to the path itself so a missing key is visible instead of silently blank.
 */
export function t(locale: Locale, path: string, vars?: Record<string, string | number>): string {
  const lookup = (dict: unknown) =>
    path.split('.').reduce<unknown>((node, key) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[key] : undefined), dict);
  const value = lookup(getDictionary(locale)) ?? lookup(en);
  return typeof value === 'string' ? format(value, vars) : path;
}

/** Country (ISO 3166-1 alpha-2) → locale. Anything unmapped falls back to English. */
const COUNTRY_LOCALE: Record<string, Locale> = {
  US: 'en', GB: 'en', CA: 'en', AU: 'en', IE: 'en', NZ: 'en',
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', UY: 'es',
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', MC: 'fr',
  DE: 'de', AT: 'de', LI: 'de',
};

export function localeFromCountry(country: string | null | undefined): Locale {
  return (country && COUNTRY_LOCALE[country.toUpperCase()]) || DEFAULT_LOCALE;
}

/** 'pt-BR' → 'pt'; unsupported → null. */
export function localeFromLanguageTag(tag: string | null | undefined): Locale | null {
  const base = tag?.slice(0, 2).toLowerCase();
  return isLocale(base) ? base : null;
}

export type { Dictionary };
