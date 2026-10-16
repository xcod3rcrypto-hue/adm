import type { PlanId } from './quiz';

/**
 * Prices are display values in cents; Stripe holds the charged amounts.
 * Keep both in sync — `npm run stripe:setup` creates Stripe prices from this file.
 *
 * Currency follows the visitor's COUNTRY (where they pay from), not their language:
 * euro-area countries see and pay the same numbers in EUR; everyone else in USD.
 */
export const CURRENCIES = ['usd', 'eur'] as const;
export type Currency = (typeof CURRENCIES)[number];
export const CURRENCY: Currency = 'usd';

/** Euro area (incl. Bulgaria since 2026) plus countries that use the euro without being members. */
const EURO_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
  'AD', 'MC', 'SM', 'VA', 'ME', 'XK',
]);

export function currencyForCountry(country: string | null | undefined): Currency {
  return country && EURO_COUNTRIES.has(country.toUpperCase()) ? 'eur' : 'usd';
}

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value);
}

export interface Plan {
  id: PlanId;
  units: number;
  amount: number; // cents
  recurring: boolean;
  priceEnv: string;
}

export const PLANS: Record<PlanId, Plan> = {
  single: { id: 'single', units: 1, amount: 2990, recurring: false, priceEnv: 'STRIPE_PRICE_SINGLE' },
  kit3: { id: 'kit3', units: 3, amount: 8000, recurring: false, priceEnv: 'STRIPE_PRICE_KIT3' },
  kit6: { id: 'kit6', units: 6, amount: 14000, recurring: true, priceEnv: 'STRIPE_PRICE_KIT6_MONTHLY' },
};

export const ORDER_BUMP = { amount: 1990, priceEnv: 'STRIPE_PRICE_BUMP' } as const;

/** Upsell 1: one-time Kit 6 at 45% off the $140 kit price. */
export const UPSELL_KIT6 = { amount: 7700, priceEnv: 'STRIPE_PRICE_UPSELL_KIT6' } as const;

/** Upsell 2: Kit 3 every month at 30% off ($80 → $56), for as long as the subscription lasts. */
export const UPSELL_SUBSCRIPTION = { amount: 5600, full: 8000, priceEnv: 'STRIPE_PRICE_UPSELL_SUB' } as const;

export function money(cents: number, locale = 'en', currency: string = CURRENCY): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}

export function savingsPct(plan: Plan): number {
  const full = PLANS.single.amount * plan.units;
  return Math.round((1 - plan.amount / full) * 100);
}

export function priceIdFor(envName: string): string {
  const id = process.env[envName];
  if (!id) throw new Error(`Missing env var ${envName}. Run "npm run stripe:setup" and copy the output into .env.local.`);
  return id;
}
