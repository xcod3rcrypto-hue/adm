/**
 * Per-country delivery promise and the "ad-safe" copy switch. Server/edge only (reads env);
 * the result reaches the browser through <Providers> (see app/layout.tsx).
 */

/** Business days promised where FAST_DELIVERY_COUNTRIES applies. The copy says "2" in every language. */
export const FAST_DELIVERY_DAYS = 2;

const list = (value: string | undefined) =>
  value?.trim() ? new Set(value.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)) : null;

/**
 * Countries with the up-to-2-business-days promise. Unset = every country we ship to.
 * Countries outside it get "tracked delivery" with no number in the copy, and Stripe
 * shows STANDARD_DELIVERY_DAYS as the estimate.
 */
export function isFastDelivery(country: string | null | undefined): boolean {
  const fast = list(process.env.FAST_DELIVERY_COUNTRIES);
  return !fast || fast.has((country ?? '').toUpperCase());
}

export function deliveryMaxDays(country: string | null | undefined): number {
  if (isFastDelivery(country)) return FAST_DELIVERY_DAYS;
  const days = Number(process.env.STANDARD_DELIVERY_DAYS ?? '7');
  return Number.isInteger(days) && days > 0 ? days : 7;
}

/**
 * When to show the neutral wording (no "desire" copy) that ad reviewers and paid visitors see:
 * 'paid' (default) = visits from a paid ad, 'always' = everyone, 'never' = nobody.
 */
export function adSafeMode(): 'paid' | 'always' | 'never' {
  const mode = process.env.AD_SAFE_MODE;
  return mode === 'always' || mode === 'never' ? mode : 'paid';
}
