/**
 * Locale utilities — no dictionaries here, so importing this module stays tiny
 * (middleware, client components). Dictionaries live in:
 *   ./dictionaries — static map for the server, emails and the demo build
 *   ./load         — per-locale dynamic import for the browser
 */
import type { Dictionary } from './en';

export const LOCALES = [
  'en', 'pt', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'sv', 'da', 'nb', 'fi', 'et', 'is',
  'cs', 'sk', 'hu', 'ro', 'bg', 'uk', 'el', 'lt', 'lv', 'hr', 'sl', 'sr', 'sq', 'mk',
] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Names shown in the language switcher (each in its own language). */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English', pt: 'Português', es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano',
  nl: 'Nederlands', pl: 'Polski', sv: 'Svenska', da: 'Dansk', nb: 'Norsk', fi: 'Suomi', et: 'Eesti',
  is: 'Íslenska', cs: 'Čeština', sk: 'Slovenčina', hu: 'Magyar', ro: 'Română', bg: 'Български',
  uk: 'Українська', el: 'Ελληνικά', lt: 'Lietuvių', lv: 'Latviešu', hr: 'Hrvatski', sl: 'Slovenščina',
  sr: 'Srpski', sq: 'Shqip', mk: 'Македонски',
};

/** English names, for instructions to Claude. */
export const LOCALE_ENGLISH_NAMES: Record<Locale, string> = {
  en: 'English', pt: 'Brazilian Portuguese', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
  nl: 'Dutch', pl: 'Polish', sv: 'Swedish', da: 'Danish', nb: 'Norwegian Bokmål', fi: 'Finnish', et: 'Estonian',
  is: 'Icelandic', cs: 'Czech', sk: 'Slovak', hu: 'Hungarian', ro: 'Romanian', bg: 'Bulgarian',
  uk: 'Ukrainian', el: 'Greek', lt: 'Lithuanian', lv: 'Latvian', hr: 'Croatian', sl: 'Slovenian',
  sr: 'Serbian (Latin script)', sq: 'Albanian', mk: 'Macedonian',
};

/** BCP 47 tag for <html lang> and Intl (Serbian copy is written in Latin script). */
export function htmlLang(locale: Locale): string {
  return locale === 'sr' ? 'sr-Latn' : locale;
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Replaces `{name}` placeholders. Missing variables are left empty. */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => (key in vars ? String(vars[key]) : ''));
}

/** Country (ISO 3166-1 alpha-2) → locale, used only when the phone language is not supported. */
const COUNTRY_LOCALE: Record<string, Locale> = {
  US: 'en', GB: 'en', CA: 'en', AU: 'en', IE: 'en', NZ: 'en', MT: 'en', IM: 'en', JE: 'en', GG: 'en', GI: 'en',
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt',
  ES: 'es', AD: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', UY: 'es',
  FR: 'fr', LU: 'fr', MC: 'fr',
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  IT: 'it', SM: 'it', VA: 'it',
  NL: 'nl', BE: 'nl',
  PL: 'pl', SE: 'sv', AX: 'sv', DK: 'da', FO: 'da', GL: 'da', NO: 'nb', SJ: 'nb',
  FI: 'fi', EE: 'et', IS: 'is', CZ: 'cs', SK: 'sk', HU: 'hu', RO: 'ro', MD: 'ro', BG: 'bg', UA: 'uk',
  GR: 'el', CY: 'el', LT: 'lt', LV: 'lv', HR: 'hr', BA: 'hr', SI: 'sl', RS: 'sr', ME: 'sr',
  AL: 'sq', XK: 'sq', MK: 'mk',
};

export function localeFromCountry(country: string | null | undefined): Locale {
  return (country && COUNTRY_LOCALE[country.toUpperCase()]) || DEFAULT_LOCALE;
}

/** Language codes we serve with a close sibling. */
const LANGUAGE_ALIASES: Record<string, Locale> = { no: 'nb', nn: 'nb', bs: 'hr', sh: 'sr', cnr: 'sr', mo: 'ro' };

/** 'pt-BR' → 'pt', 'nn-NO' → 'nb'; unsupported → null. */
export function localeFromLanguageTag(tag: string | null | undefined): Locale | null {
  const primary = tag?.trim().split(/[-_]/)[0]?.toLowerCase();
  if (!primary) return null;
  if (isLocale(primary)) return primary;
  return LANGUAGE_ALIASES[primary] ?? null;
}

/** First supported language in a preference list (navigator.languages order). */
export function localeFromLanguageList(tags: readonly string[] | null | undefined): Locale | null {
  for (const tag of tags ?? []) {
    const locale = localeFromLanguageTag(tag);
    if (locale) return locale;
  }
  return null;
}

/**
 * The visitor's phone/browser language from the Accept-Language header,
 * e.g. "es-US,es;q=0.9,en;q=0.8" → 'es'. Honors q-values; unsupported languages are skipped.
 */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const weight = q ? Number(q.slice(2)) : 1;
      return { tag: tag.trim(), weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter((x) => x.tag && x.tag !== '*' && x.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  return localeFromLanguageList(ranked.map((x) => x.tag));
}

/** Languages Stripe Checkout supports; others get 'auto' (Stripe uses the browser language). */
const STRIPE_LOCALES = new Set(['bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr', 'hr', 'hu', 'it', 'lt', 'lv', 'nb', 'nl', 'pl', 'pt', 'ro', 'sk', 'sl', 'sv']);

export function stripeLocale(locale: Locale): string {
  if (locale === 'pt') return 'pt-BR';
  return STRIPE_LOCALES.has(locale) ? locale : 'auto';
}

export type { Dictionary };
