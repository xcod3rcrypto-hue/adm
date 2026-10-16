import type { NextRequest } from 'next/server';
import { badRequest, clientIp, json, rateLimited, readJson } from '@/lib/http';
import { findPromotionCode } from '@/lib/checkout';

export const dynamic = 'force-dynamic';

/** Validates a promotion code against Stripe so the cart can show the discount. */
export async function POST(req: NextRequest) {
  if (rateLimited(`coupon:${clientIp(req)}`, 15, 60_000)) return json({ error: 'Too many requests' }, 429);
  const body = await readJson<{ code?: unknown }>(req);
  const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!code || code.length > 40) return badRequest('Invalid code');
  const promo = await findPromotionCode(code);
  return json(promo ? { valid: true, percentOff: promo.percentOff, amountOff: promo.amountOff } : { valid: false });
}
