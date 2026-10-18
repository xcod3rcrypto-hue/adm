/**
 * Creates (or reuses) the VitalRise products, prices and the VITAL10 promotion code in Stripe.
 * Idempotent: prices are found by lookup_key, so running it twice changes nothing.
 *
 *   npm run stripe:setup            (reads STRIPE_SECRET_KEY from .env.local)
 *
 * Copy the printed STRIPE_PRICE_* lines into .env.local / Vercel env.
 */
import Stripe from 'stripe';
import { CURRENCIES, PLANS, PRICES, SKU_PRICE_ENV, type Sku } from '../lib/products';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('STRIPE_SECRET_KEY is not set (put it in .env.local).');
  process.exit(1);
}
const stripe = new Stripe(key);

interface PriceSpec {
  sku: Sku;
  env: string;
  lookupKey: string;
  productName: string;
  /** Renewal interval in months for subscription prices. */
  everyMonths?: number;
}

const specs: PriceSpec[] = [
  { sku: 'single', env: PLANS.single.priceEnv, lookupKey: 'rc_single', productName: 'VitalRise — 1 unit' },
  { sku: 'kit3', env: PLANS.kit3.priceEnv, lookupKey: 'rc_kit3', productName: 'VitalRise — Kit 3' },
  { sku: 'kit6', env: PLANS.kit6.priceEnv, lookupKey: 'rc_kit6', productName: 'VitalRise — Kit 6' },
  { sku: 'single', env: PLANS.single.subPriceEnv, lookupKey: 'rc_single_sub', productName: 'VitalRise — 1 unit (subscription, monthly)', everyMonths: 1 },
  { sku: 'kit3', env: PLANS.kit3.subPriceEnv, lookupKey: 'rc_kit3_sub', productName: 'VitalRise — Kit 3 (subscription, every 3 months)', everyMonths: 3 },
  { sku: 'kit6', env: PLANS.kit6.subPriceEnv, lookupKey: 'rc_kit6_sub', productName: 'VitalRise — Kit 6 (subscription, every 6 months)', everyMonths: 6 },
  { sku: 'bump', env: SKU_PRICE_ENV.bump, lookupKey: 'rc_bump_unit', productName: 'VitalRise — Extra unit (order bump)' },
  { sku: 'upsellKit6', env: SKU_PRICE_ENV.upsellKit6, lookupKey: 'rc_upsell_kit6', productName: 'VitalRise — Kit 6 (45% off offer)' },
  { sku: 'upsellSub', env: SKU_PRICE_ENV.upsellSub, lookupKey: 'rc_upsell_sub_3m', productName: 'VitalRise — Kit 3 every 3 months (member price)', everyMonths: 3 },
];

/** Every non-USD currency in lib/products.ts as a Stripe currency option for this SKU. */
function currencyOptions(sku: Sku): Record<string, { unit_amount: number }> {
  return Object.fromEntries(CURRENCIES.filter((c) => c !== 'usd').map((c) => [c, { unit_amount: PRICES[c][sku] }]));
}

async function ensurePrice(spec: PriceSpec): Promise<string> {
  const amount = PRICES.usd[spec.sku];
  const options = currencyOptions(spec.sku);
  const existing = await stripe.prices.list({ lookup_keys: [spec.lookupKey], active: true, limit: 1, expand: ['data.currency_options'] });
  const found = existing.data[0];
  if (found) {
    if (found.unit_amount !== amount) {
      console.warn(`! ${spec.lookupKey} exists with ${found.unit_amount} USD but products.ts says ${amount}. Archive it in Stripe to recreate.`);
    }
    const stale = Object.entries(options).filter(([c, o]) => found.currency_options?.[c]?.unit_amount !== o.unit_amount);
    if (stale.length) {
      await stripe.prices.update(found.id, { currency_options: options });
      console.log(`+ ${spec.lookupKey}: currency options updated (${stale.map(([c]) => c.toUpperCase()).join(', ')})`);
    }
    return found.id;
  }
  const product = await stripe.products.create({ name: spec.productName, metadata: { lookup_key: spec.lookupKey } });
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount: amount,
    lookup_key: spec.lookupKey,
    currency_options: options,
    ...(spec.everyMonths ? { recurring: { interval: 'month' as const, interval_count: spec.everyMonths } } : {}),
  });
  return price.id;
}

async function ensurePromotionCode(): Promise<void> {
  const code = 'VITAL10';
  const existing = await stripe.promotionCodes.list({ code, active: true, limit: 1 });
  if (existing.data.length) return;
  let coupon: Stripe.Coupon;
  try {
    coupon = await stripe.coupons.retrieve('vital10');
  } catch {
    coupon = await stripe.coupons.create({ id: 'vital10', percent_off: 10, duration: 'once', name: 'VITAL10 — 10% off' });
  }
  await stripe.promotionCodes.create({ promotion: { type: 'coupon', coupon: coupon.id }, code });
}

async function main() {
  const lines: string[] = [];
  for (const spec of specs) lines.push(`${spec.env}=${await ensurePrice(spec)}`);
  await ensurePromotionCode();
  console.log('\nStripe is ready. Add these to .env.local:\n');
  console.log(lines.join('\n'));
  console.log(`\nEvery price also has options in ${CURRENCIES.filter((c) => c !== 'usd').join(', ').toUpperCase()} (from lib/products.ts).`);
  console.log('Promotion code VITAL10 (10% off, first payment) is active.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
