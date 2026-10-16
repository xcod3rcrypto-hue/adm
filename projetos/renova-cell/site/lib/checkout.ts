import 'server-only';
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

export function shippingCountries(): string[] {
  return (process.env.SHIP_COUNTRIES ?? 'US,CA,GB,AU,BR,PT,ES,MX,AR,FR,BE,CH,DE,AT')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
}
