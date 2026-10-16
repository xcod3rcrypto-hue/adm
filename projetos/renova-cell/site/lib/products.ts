import type { PlanId } from './quiz';

/**
 * Prices and currencies. Display and charge come from the same table, so the page never
 * shows one number and Stripe charges another. `npm run stripe:setup` pushes this table to
 * Stripe (USD as the base price, every other currency as a currency option).
 *
 * Currency follows the visitor's COUNTRY (where they pay from), not their language.
 * USD and EUR use the same numbers. The other European currencies were converted from the
 * EUR prices with the ECB reference rates of 15 Oct 2026 (GBP 0.8461, CHF 0.9305,
 * SEK 11.1765, NOK 10.652, DKK 7.475, ISK 136.4, PLN 4.37, CZK 24.353, HUF 363.6,
 * RON 5.3337) and rounded to local price points; the upsells are exactly 45% / 30% off
 * the rounded local kit prices (±0.5 pp). Review them before launch and after big FX moves.
 */
export const CURRENCIES = ['usd', 'eur', 'gbp', 'chf', 'sek', 'nok', 'dkk', 'isk', 'pln', 'czk', 'huf', 'ron'] as const;
export type Currency = (typeof CURRENCIES)[number];
export const CURRENCY: Currency = 'usd';

export type Sku = 'single' | 'kit3' | 'kit6' | 'bump' | 'upsellKit6' | 'upsellSub';

/** Amounts in minor units (cents, øre, fillér…), as Stripe expects. */
export const PRICES: Record<Currency, Record<Sku, number>> = {
  usd: { single: 2990, kit3: 8000, kit6: 14000, bump: 1990, upsellKit6: 7700, upsellSub: 5600 },
  eur: { single: 2990, kit3: 8000, kit6: 14000, bump: 1990, upsellKit6: 7700, upsellSub: 5600 },
  gbp: { single: 2490, kit3: 6800, kit6: 12000, bump: 1690, upsellKit6: 6600, upsellSub: 4760 },
  chf: { single: 2790, kit3: 7400, kit6: 13000, bump: 1890, upsellKit6: 7150, upsellSub: 5180 },
  sek: { single: 32900, kit3: 89000, kit6: 160000, bump: 21900, upsellKit6: 88000, upsellSub: 62500 },
  nok: { single: 31900, kit3: 85000, kit6: 150000, bump: 20900, upsellKit6: 82500, upsellSub: 59500 },
  dkk: { single: 21900, kit3: 60000, kit6: 100000, bump: 14900, upsellKit6: 55000, upsellSub: 42000 },
  isk: { single: 409000, kit3: 1090000, kit6: 1910000, bump: 269000, upsellKit6: 1050000, upsellSub: 763000 },
  pln: { single: 12900, kit3: 35000, kit6: 61000, bump: 8690, upsellKit6: 33500, upsellSub: 24500 },
  czk: { single: 72900, kit3: 190000, kit6: 340000, bump: 47900, upsellKit6: 187000, upsellSub: 133000 },
  huf: { single: 1099000, kit3: 2910000, kit6: 5090000, bump: 719000, upsellKit6: 2800000, upsellSub: 2040000 },
  ron: { single: 15900, kit3: 43000, kit6: 75000, bump: 10900, upsellKit6: 41500, upsellSub: 30000 },
};

const COUNTRY_CURRENCY: Record<string, Currency> = {
  // Euro area (Bulgaria since 2026) and countries that use the euro.
  AT: 'eur', BE: 'eur', BG: 'eur', HR: 'eur', CY: 'eur', EE: 'eur', FI: 'eur', FR: 'eur', DE: 'eur', GR: 'eur',
  IE: 'eur', IT: 'eur', LV: 'eur', LT: 'eur', LU: 'eur', MT: 'eur', NL: 'eur', PT: 'eur', SK: 'eur', SI: 'eur',
  ES: 'eur', AD: 'eur', MC: 'eur', SM: 'eur', VA: 'eur', ME: 'eur', XK: 'eur', AX: 'eur',
  // European countries whose own currency we do not price in: charged in euros.
  RS: 'eur', MK: 'eur', AL: 'eur', BA: 'eur', MD: 'eur', UA: 'eur',
  GB: 'gbp', IM: 'gbp', JE: 'gbp', GG: 'gbp', GI: 'gbp',
  CH: 'chf', LI: 'chf',
  SE: 'sek',
  NO: 'nok', SJ: 'nok',
  DK: 'dkk', FO: 'dkk', GL: 'dkk',
  IS: 'isk',
  PL: 'pln',
  CZ: 'czk',
  HU: 'huf',
  RO: 'ron',
};

export function currencyForCountry(country: string | null | undefined): Currency {
  return (country && COUNTRY_CURRENCY[country.toUpperCase()]) || 'usd';
}

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value);
}

export function price(sku: Sku, currency: Currency = CURRENCY): number {
  return PRICES[currency]?.[sku] ?? PRICES.usd[sku];
}

export interface Plan {
  id: PlanId;
  units: number;
  /** USD amount, kept for code that predates multi-currency; prefer price(plan.id, currency). */
  amount: number;
  recurring: boolean;
  priceEnv: string;
}

export const PLANS: Record<PlanId, Plan> = {
  single: { id: 'single', units: 1, amount: PRICES.usd.single, recurring: false, priceEnv: 'STRIPE_PRICE_SINGLE' },
  kit3: { id: 'kit3', units: 3, amount: PRICES.usd.kit3, recurring: false, priceEnv: 'STRIPE_PRICE_KIT3' },
  kit6: { id: 'kit6', units: 6, amount: PRICES.usd.kit6, recurring: true, priceEnv: 'STRIPE_PRICE_KIT6_MONTHLY' },
};

export const ORDER_BUMP = { amount: PRICES.usd.bump, priceEnv: 'STRIPE_PRICE_BUMP' } as const;

/** Upsell 1: one-time Kit 6 at 45% off the Kit 6 price. */
export const UPSELL_KIT6 = { amount: PRICES.usd.upsellKit6, priceEnv: 'STRIPE_PRICE_UPSELL_KIT6' } as const;

/** Upsell 2: Kit 3 every month at 30% off, for as long as the subscription lasts. */
export const UPSELL_SUBSCRIPTION = { amount: PRICES.usd.upsellSub, full: PRICES.usd.kit3, priceEnv: 'STRIPE_PRICE_UPSELL_SUB' } as const;

/** Stripe price env var for each SKU (one Stripe price per SKU, with currency options). */
export const SKU_PRICE_ENV: Record<Sku, string> = {
  single: PLANS.single.priceEnv,
  kit3: PLANS.kit3.priceEnv,
  kit6: PLANS.kit6.priceEnv,
  bump: ORDER_BUMP.priceEnv,
  upsellKit6: UPSELL_KIT6.priceEnv,
  upsellSub: UPSELL_SUBSCRIPTION.priceEnv,
};

/** Currencies whose whole amounts are written without decimals (299 kr, 11 990 Ft, 1 900 Kč). */
const NO_DECIMALS_WHEN_WHOLE = new Set(['sek', 'nok', 'dkk', 'isk', 'czk', 'huf']);

export function money(cents: number, locale = 'en', currency: string = CURRENCY): string {
  const whole = cents % 100 === 0;
  const digits = whole && NO_DECIMALS_WHEN_WHOLE.has(currency.toLowerCase()) ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(cents / 100);
}

/** Savings of a kit versus buying the same number of single units, in the given currency. */
export function savingsPct(plan: Plan, currency: Currency = CURRENCY): number {
  const full = price('single', currency) * plan.units;
  return Math.round((1 - price(plan.id, currency) / full) * 100);
}

export function priceIdFor(envName: string): string {
  const id = process.env[envName];
  if (!id) throw new Error(`Missing env var ${envName}. Run "npm run stripe:setup" and copy the output into .env.local.`);
  return id;
}
