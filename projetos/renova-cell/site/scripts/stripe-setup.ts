/**
 * Creates (or reuses) the RENOVA CELL products, prices and the RENOVA10 promotion code in Stripe.
 * Idempotent: prices are found by lookup_key, so running it twice changes nothing.
 *
 *   npm run stripe:setup            (reads STRIPE_SECRET_KEY from .env.local)
 *
 * Copy the printed STRIPE_PRICE_* lines into .env.local / Vercel env.
 */
import Stripe from 'stripe';
import { CURRENCY, ORDER_BUMP, PLANS, UPSELL_KIT6, UPSELL_SUBSCRIPTION } from '../lib/products';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('STRIPE_SECRET_KEY is not set (put it in .env.local).');
  process.exit(1);
}
const stripe = new Stripe(key);

interface PriceSpec {
  env: string;
  lookupKey: string;
  productName: string;
  amount: number;
  recurring: boolean;
}

const specs: PriceSpec[] = [
  { env: PLANS.single.priceEnv, lookupKey: 'rc_single', productName: 'RENOVA CELL — 1 unit', amount: PLANS.single.amount, recurring: false },
  { env: PLANS.kit3.priceEnv, lookupKey: 'rc_kit3', productName: 'RENOVA CELL — Kit 3', amount: PLANS.kit3.amount, recurring: false },
  { env: PLANS.kit6.priceEnv, lookupKey: 'rc_kit6_monthly', productName: 'RENOVA CELL — Kit 6 (monthly)', amount: PLANS.kit6.amount, recurring: true },
  { env: ORDER_BUMP.priceEnv, lookupKey: 'rc_bump_unit', productName: 'RENOVA CELL — Extra unit (order bump)', amount: ORDER_BUMP.amount, recurring: false },
  { env: UPSELL_KIT6.priceEnv, lookupKey: 'rc_upsell_kit6', productName: 'RENOVA CELL — Kit 6 (45% off offer)', amount: UPSELL_KIT6.amount, recurring: false },
  { env: UPSELL_SUBSCRIPTION.priceEnv, lookupKey: 'rc_upsell_sub', productName: 'RENOVA CELL — Kit 3 monthly (member price)', amount: UPSELL_SUBSCRIPTION.amount, recurring: true },
];

async function ensurePrice(spec: PriceSpec): Promise<string> {
  const existing = await stripe.prices.list({ lookup_keys: [spec.lookupKey], active: true, limit: 1 });
  const found = existing.data[0];
  if (found) {
    if (found.unit_amount !== spec.amount) {
      console.warn(`! ${spec.lookupKey} exists with ${found.unit_amount} but products.ts says ${spec.amount}. Archive it in Stripe to recreate.`);
    }
    return found.id;
  }
  const product = await stripe.products.create({ name: spec.productName, metadata: { lookup_key: spec.lookupKey } });
  const price = await stripe.prices.create({
    product: product.id,
    currency: CURRENCY,
    unit_amount: spec.amount,
    lookup_key: spec.lookupKey,
    ...(spec.recurring ? { recurring: { interval: 'month' as const } } : {}),
  });
  return price.id;
}

async function ensurePromotionCode(): Promise<void> {
  const code = 'RENOVA10';
  const existing = await stripe.promotionCodes.list({ code, active: true, limit: 1 });
  if (existing.data.length) return;
  let coupon: Stripe.Coupon;
  try {
    coupon = await stripe.coupons.retrieve('renova10');
  } catch {
    coupon = await stripe.coupons.create({ id: 'renova10', percent_off: 10, duration: 'once', name: 'RENOVA10 — 10% off' });
  }
  await stripe.promotionCodes.create({ promotion: { type: 'coupon', coupon: coupon.id }, code });
}

async function main() {
  const lines: string[] = [];
  for (const spec of specs) lines.push(`${spec.env}=${await ensurePrice(spec)}`);
  await ensurePromotionCode();
  console.log('\nStripe is ready. Add these to .env.local:\n');
  console.log(lines.join('\n'));
  console.log('\nPromotion code RENOVA10 (10% off, first payment) is active.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
