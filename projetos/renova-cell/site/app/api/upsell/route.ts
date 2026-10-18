import Stripe from 'stripe';
import type { NextRequest } from 'next/server';
import { badRequest, clientIp, json, rateLimited, readJson } from '@/lib/http';
import { paidSession, recordUpsell } from '@/lib/orders';
import { UPSELL_KIT6, UPSELL_SUBSCRIPTION, priceIdFor } from '@/lib/products';
import { siteUrl } from '@/lib/site';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const OFFERS = {
  kit6: { priceEnv: UPSELL_KIT6.priceEnv, next: '/upsell-2' },
  subscription: { priceEnv: UPSELL_SUBSCRIPTION.priceEnv, next: '/thank-you' },
} as const;
type Offer = keyof typeof OFFERS;

/** Upsells are only offered right after purchase. */
const MAX_SESSION_AGE_S = 60 * 60;

/**
 * 1-click upsell: charges the card saved during checkout, off-session.
 * Idempotency keys make double-clicks and retries safe (one charge per offer per order).
 * If the bank requires authentication, we fall back to a hosted Checkout page.
 */
export async function POST(req: NextRequest) {
  if (await rateLimited(`upsell:${clientIp(req)}`, 10, 60_000)) return json({ error: 'Too many requests' }, 429);
  const body = await readJson<{ sessionId?: unknown; offer?: unknown }>(req);
  const offerKey = body?.offer as Offer;
  if (!body || !(offerKey in OFFERS)) return badRequest('Invalid offer');
  const offer = OFFERS[offerKey];

  const session = await paidSession(body.sessionId);
  if (!session || session.mode !== 'payment') return badRequest('Invalid session');
  if (Date.now() / 1000 - session.created > MAX_SESSION_AGE_S) return json({ error: 'Offer expired' }, 410);

  const customer = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const intent = session.payment_intent as Stripe.PaymentIntent | null;
  const paymentMethod = typeof intent?.payment_method === 'string' ? intent.payment_method : intent?.payment_method?.id;
  if (!customer || !paymentMethod) return badRequest('No saved payment method');

  const s = stripe();
  let priceId: string;
  try {
    priceId = priceIdFor(offer.priceEnv);
  } catch (error) {
    console.error(error);
    return json({ status: 'failed', error: 'Upsell is not configured' }, 503);
  }
  const idempotencyKey = `upsell-${offerKey}-${session.id}`;
  const metadata = { upsell: offerKey, parent_session: session.id, quiz_id: session.metadata?.quiz_id ?? '' };

  try {
    if (offerKey === 'kit6') {
      // Charge in the same currency as the original order (USD or EUR).
      const currency = session.currency ?? 'usd';
      const price = await s.prices.retrieve(priceId, { expand: ['currency_options'] });
      const amount = currency === price.currency ? price.unit_amount : price.currency_options?.[currency]?.unit_amount;
      if (!amount) throw new Error(`Upsell price has no amount in ${currency}`);
      const pi = await s.paymentIntents.create(
        {
          amount,
          currency,
          customer,
          payment_method: paymentMethod,
          off_session: true,
          confirm: true,
          description: 'VitalRise — Kit 6 (post-purchase offer)',
          metadata,
        },
        { idempotencyKey },
      );
      if (pi.status !== 'succeeded' && pi.status !== 'processing') throw new Error(`PaymentIntent ${pi.status}`);
      await recordUpsell(session.id, { offer: offerKey, payment_intent: pi.id, amount: pi.amount });
    } else {
      const sub = await s.subscriptions.create(
        {
          customer,
          items: [{ price: priceId }],
          currency: session.currency ?? 'usd',
          default_payment_method: paymentMethod,
          off_session: true,
          payment_behavior: 'error_if_incomplete',
          metadata,
        },
        { idempotencyKey },
      );
      await recordUpsell(session.id, { offer: offerKey, subscription: sub.id });
    }
    return json({ status: 'succeeded', next: `${offer.next}?session_id=${session.id}` });
  } catch (error) {
    // Card needs 3-D Secure (or was declined): send the buyer to a hosted page for this item only.
    if (error instanceof Stripe.errors.StripeCardError) {
      const fallback = await s.checkout.sessions.create({
        mode: offerKey === 'subscription' ? 'subscription' : 'payment',
        currency: session.currency ?? 'usd',
        customer,
        line_items: [{ price: priceId, quantity: 1 }],
        metadata,
        success_url: `${siteUrl()}${offer.next}?session_id=${session.id}`,
        cancel_url: `${siteUrl()}${offer.next}?session_id=${session.id}`,
      });
      return json({ status: 'requires_action', url: fallback.url });
    }
    console.error('upsell failed', error);
    return json({ status: 'failed' }, 502);
  }
}
