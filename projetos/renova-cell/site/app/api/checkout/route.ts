import type Stripe from 'stripe';
import type { NextRequest } from 'next/server';
import { clickOf, utmOf } from '@/lib/attribution';
import { BLOCKED_COUNTRIES, findPromotionCode, shippingCountries } from '@/lib/checkout';
import { EMAIL_RE, badRequest, clientIp, json, localeOr, rateLimited, readJson } from '@/lib/http';
import { stripeLocale } from '@/lib/i18n';
import { deliveryMaxDays, isFastDelivery } from '@/lib/market';
import { capiAllowed, capiMetadata, type Consent } from '@/lib/meta-capi';
import { ORDER_BUMP, PLANS, currencyForCountry, priceIdFor } from '@/lib/products';
import type { PlanId } from '@/lib/quiz';
import { siteUrl } from '@/lib/site';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

interface Body {
  plan?: unknown;
  subscribe?: unknown;
  bump?: unknown;
  coupon?: unknown;
  email?: unknown;
  name?: unknown;
  newsletter?: unknown;
  quizId?: unknown;
  locale?: unknown;
  attribution?: unknown;
  consent?: unknown;
}

/**
 * Creates a Stripe Checkout Session.
 * - Wallets (Apple Pay, Google Pay), PayPal and pay-later methods appear automatically
 *   when enabled in the Stripe Dashboard (dynamic payment methods).
 * - One-time plans save the card (`setup_future_usage: off_session`) so the
 *   post-purchase upsells can be 1-click. The upsell pages disclose this before charging.
 */
export async function POST(req: NextRequest) {
  if (await rateLimited(`checkout:${clientIp(req)}`, 10, 60_000)) return json({ error: 'Too many requests' }, 429);
  const body = await readJson<Body>(req);
  const planId = body?.plan as PlanId;
  const plan = PLANS[planId];
  if (!body || !plan) return badRequest('Invalid plan');
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) return badRequest('Invalid email');
  const locale = localeOr(body.locale);
  // Charged currency comes from the IP country, never from the request body.
  const country = req.headers.get('x-vercel-ip-country')?.toUpperCase() ?? '';
  if (BLOCKED_COUNTRIES.has(country)) return json({ error: 'not_available' }, 403);
  const currency = currencyForCountry(country);
  const quizId = typeof body.quizId === 'string' && /^[0-9a-f-]{36}$/i.test(body.quizId) ? body.quizId : '';
  const bump = body.bump === true;
  const subscribe = body.subscribe === true;
  const consent: Consent = body.consent === 'granted' || body.consent === 'denied' ? body.consent : null;
  const maxDays = deliveryMaxDays(country);
  // Subscribers and Kit 6 buyers skip the 1-click upsells (the first is a Kit 6, the second a subscription).
  const upsells = !subscribe && plan.id !== 'kit6';

  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  try {
    lineItems = [{ price: priceIdFor(subscribe ? plan.subPriceEnv : plan.priceEnv), quantity: 1 }];
    if (bump) lineItems.push({ price: priceIdFor(ORDER_BUMP.priceEnv), quantity: 1 });
  } catch (error) {
    console.error(error);
    return json({ error: 'Checkout is not configured' }, 503);
  }

  const code = typeof body.coupon === 'string' ? body.coupon.trim().toUpperCase() : '';
  const promo = code ? await findPromotionCode(code) : null;

  const metadata = {
    plan: plan.id,
    subscribe: String(subscribe),
    bump: String(bump),
    quiz_id: quizId,
    locale,
    newsletter: String(body.newsletter === true),
    name: typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '',
    // Which ad brought the order (utm_content = ad id). Also stored on the order row.
    ...utmOf(body.attribution),
  };
  // Meta Conversions API: click data only when this visitor's consent allows it (lib/meta-capi.ts).
  // Kept on the session only, not copied to the payment or subscription.
  const capi = capiAllowed(consent, country)
    ? capiMetadata({ cookies: req.cookies, headers: req.headers, ...clickOf(body.attribution) })
    : {};

  const base = siteUrl();
  const params: Stripe.Checkout.SessionCreateParams = {
    // A subscription renews when the supply runs out (every plan.months months).
    mode: subscribe ? 'subscription' : 'payment',
    line_items: lineItems,
    // Prices carry an EUR currency option (npm run stripe:setup); USD is their default currency.
    currency,
    customer_email: email,
    locale: stripeLocale(locale),
    shipping_address_collection: {
      allowed_countries: shippingCountries() as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
    },
    phone_number_collection: { enabled: true },
    metadata: { ...metadata, ...capi },
    ...(promo ? { discounts: [{ promotion_code: promo.id }] } : { allow_promotion_codes: true }),
    success_url: !upsells
      ? `${base}/thank-you?session_id={CHECKOUT_SESSION_ID}`
      : `${base}/upsell-1?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/checkout?canceled=1`,
  };
  // Free shipping everywhere we ship. Shipping rates only exist in payment mode, so
  // subscriptions say it on the address step instead (nothing is charged for shipping either way).
  if (subscribe) {
    params.subscription_data = { metadata };
    params.custom_text = {
      shipping_address: {
        message: isFastDelivery(country)
          ? `Free shipping · delivery in up to ${maxDays} business days · discreet packaging.`
          : 'Free shipping · tracked delivery · discreet packaging.',
      },
    };
  } else {
    params.shipping_options = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency },
          display_name: 'Free shipping · discreet packaging',
          delivery_estimate: { minimum: { unit: 'business_day', value: 1 }, maximum: { unit: 'business_day', value: maxDays } },
        },
      },
    ];
    params.customer_creation = 'always';
    // The card is saved only when the 1-click upsells follow (they charge it off-session).
    params.payment_intent_data = upsells ? { setup_future_usage: 'off_session', metadata } : { metadata };
  }

  try {
    const session = await stripe().checkout.sessions.create(params);
    return json({ url: session.url });
  } catch (error) {
    console.error('checkout session failed', error);
    return json({ error: 'Could not start checkout' }, 502);
  }
}
