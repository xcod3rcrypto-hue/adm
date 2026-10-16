/**
 * Every dictionary, statically imported. For server code (emails, follow-ups, the first
 * render) and the demo build. Browser code loads one locale at a time via ./load.
 */
import { de } from './de';
import { en, type Dictionary } from './en';
import { es } from './es';
import { fr } from './fr';
import { format, type Locale } from './index';
import { pt } from './pt';

const dictionaries: Partial<Record<Locale, Dictionary>> = { en, pt, es, fr, de };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
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
