/**
 * Where a visitor came from: the UTM tags of the ad link plus Meta's click id (fbclid).
 * Captured on the landing URL, kept in the funnel store and sent with the quiz and the
 * checkout, so every quiz row and order can be traced to the ad (utm_content = ad id)
 * without depending on cookies or the pixel.
 */
export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;

export interface Attribution extends Utm {
  fbclid?: string;
  /** ms since epoch of the click (Meta's fbc needs it). */
  landedAt?: number;
}

/** utm_medium values that mean "this visit came from a paid ad". */
const PAID_MEDIUMS = new Set(['paid', 'cpc', 'ppc', 'paid_social', 'paidsocial', 'paid-social', 'ads', 'ad']);
const CLICK_IDS = ['fbclid', 'gclid', 'ttclid', 'msclkid'];

const clean = (value: unknown, max = 100): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined;

/** The attribution in a landing URL's query string, or null when it carries none. */
export function attributionFromSearch(search: string): Attribution | null {
  const params = new URLSearchParams(search);
  const a: Attribution = {};
  for (const key of UTM_KEYS) {
    const v = clean(params.get(key));
    if (v) a[key] = v;
  }
  const fbclid = clean(params.get('fbclid'), 500);
  if (fbclid) a.fbclid = fbclid;
  if (Object.keys(a).length === 0) return null;
  a.landedAt = Date.now();
  return a;
}

/** Only the UTM tags of an untrusted value (request body), or null if there are none. */
export function utmOf(value: unknown): Utm | null {
  if (!value || typeof value !== 'object') return null;
  const src = value as Record<string, unknown>;
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const v = clean(src[key]);
    if (v) utm[key] = v;
  }
  return Object.keys(utm).length ? utm : null;
}

/** Meta click id and click time of an untrusted value (request body). */
export function clickOf(value: unknown): { fbclid?: string; landedAt?: number } {
  if (!value || typeof value !== 'object') return {};
  const src = value as Record<string, unknown>;
  const landedAt = typeof src.landedAt === 'number' && Number.isFinite(src.landedAt) ? src.landedAt : undefined;
  return { fbclid: clean(src.fbclid, 500), landedAt };
}

/** true when the URL is a paid-ad click (paid utm_medium or an ad network click id). */
export function isPaidVisit(params: URLSearchParams): boolean {
  if (PAID_MEDIUMS.has((params.get('utm_medium') ?? '').toLowerCase())) return true;
  return CLICK_IDS.some((id) => params.has(id));
}
