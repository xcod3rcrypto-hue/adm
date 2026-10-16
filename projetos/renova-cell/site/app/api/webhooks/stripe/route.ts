import type Stripe from 'stripe';
import type { NextRequest } from 'next/server';
import { json } from '@/lib/http';
import { recordOrder } from '@/lib/orders';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/** Source of truth for orders: Stripe tells us a checkout completed; the browser never does. */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get('stripe-signature');
  if (!secret || !signature) return json({ error: 'Webhook not configured' }, 400);

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(await req.text(), signature, secret);
  } catch (error) {
    console.error('webhook signature failed', error);
    return json({ error: 'Invalid signature' }, 400);
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object;
      // Upsell fallback sessions carry `upsell` metadata and are recorded by /api/upsell's flow instead.
      if (session.payment_status === 'paid' && !session.metadata?.upsell) await recordOrder(session);
      break;
    }
    default:
      break;
  }
  return json({ received: true });
}
