import 'server-only';
import { EUROPE_COUNTRIES } from './products';
import { stripe } from './stripe';

export interface Promo {
  id: string;
  percentOff: number | null;
  amountOff: number | null;
}

/** Looks up an active Stripe promotion code by its customer-facing code (e.g. RENOVA10). */
export async function findPromotionCode(code: string): Promise<Promo | null> {
  try {
    const list = await stripe().promotionCodes.list({ code, active: true, limit: 1, expand: ['data.promotion.coupon'] });
    const promo = list.data[0];
    if (!promo) return null;
    const coupon = typeof promo.promotion.coupon === 'string' ? null : promo.promotion.coupon;
    return { id: promo.id, percentOff: coupon?.percent_off ?? null, amountOff: coupon?.amount_off ?? null };
  } catch (error) {
    console.error('promotion code lookup failed', error);
    return null;
  }
}

/** Never shipped to, even if SHIP_COUNTRIES lists them. */
export const BLOCKED_COUNTRIES = new Set(['UA', 'RU']);

/** All of Europe plus the Americas, Oceania and the Gulf. SHIP_COUNTRIES overrides it. */
const DEFAULT_SHIP_COUNTRIES = [
  ...EUROPE_COUNTRIES,
  'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'UY', 'AU', 'NZ', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM',
];

export function shippingCountries(): string[] {
  const list = process.env.SHIP_COUNTRIES?.trim() ? process.env.SHIP_COUNTRIES.split(',') : DEFAULT_SHIP_COUNTRIES;
  return [...new Set(list.map((c) => c.trim().toUpperCase()))].filter((c) => c && !BLOCKED_COUNTRIES.has(c));
}
