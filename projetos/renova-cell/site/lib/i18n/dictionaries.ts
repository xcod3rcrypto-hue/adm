/**
 * Every dictionary, statically imported. For server code (emails, follow-ups, the first
 * render) and the demo build. Browser code loads one locale at a time via ./load.
 */
import { bg } from './bg';
import { cs } from './cs';
import { da } from './da';
import { de } from './de';
import { el } from './el';
import { en, type Dictionary } from './en';
import { es } from './es';
import { et } from './et';
import { fi } from './fi';
import { fr } from './fr';
import { hr } from './hr';
import { hu } from './hu';
import { format, type Locale } from './index';
import { is } from './is';
import { it } from './it';
import { lt } from './lt';
import { lv } from './lv';
import { mk } from './mk';
import { nb } from './nb';
import { nl } from './nl';
import { pl } from './pl';
import { pt } from './pt';
import { ro } from './ro';
import { sk } from './sk';
import { sl } from './sl';
import { sq } from './sq';
import { sr } from './sr';
import { sv } from './sv';
import { uk } from './uk';

const dictionaries: Record<Locale, Dictionary> = {
  en, pt, es, fr, de, it, nl, pl, sv, da, nb, fi, et, is, cs, sk, hu, ro, bg, uk, el, lt, lv, hr, sl, sr, sq, mk,
};

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
