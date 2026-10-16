import 'server-only';
import type Stripe from 'stripe';
import { stripe } from './stripe';
import { db } from './supabase';

/** Retrieves a paid checkout session; null if missing, unpaid or not ours. */
export async function paidSession(sessionId: unknown): Promise<Stripe.Checkout.Session | null> {
  if (typeof sessionId !== 'string' || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return null;
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ['payment_intent'] });
    return session.payment_status === 'paid' || session.payment_status === 'no_payment_required' ? session : null;
  } catch {
    return null;
  }
}

/** Upserts the order row from a completed checkout session (idempotent on stripe_session_id). */
export async function recordOrder(session: Stripe.Checkout.Session): Promise<void> {
  const supabase = db();
  if (!supabase) return;
  const quizId = session.metadata?.quiz_id || null;
  const { error } = await supabase.from('orders').upsert(
    {
      stripe_session_id: session.id,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null),
      email: session.customer_details?.email ?? session.customer_email,
      plan: session.metadata?.plan ?? null,
      bump: session.metadata?.bump === 'true',
      amount_cents: session.amount_total,
      currency: session.currency,
      quiz_id: quizId,
      status: 'paid',
    },
    { onConflict: 'stripe_session_id', ignoreDuplicates: false },
  );
  if (error) console.error('order upsert failed', error);
  if (quizId) await supabase.from('quiz_responses').update({ purchased: true }).eq('id', quizId);
}

/** Appends an upsell to the order (read-modify-write; upsells are rare and per-buyer). */
export async function recordUpsell(sessionId: string, upsell: Record<string, unknown>): Promise<void> {
  const supabase = db();
  if (!supabase) return;
  const { data } = await supabase.from('orders').select('upsells').eq('stripe_session_id', sessionId).maybeSingle();
  const upsells = Array.isArray(data?.upsells) ? data.upsells : [];
  await supabase
    .from('orders')
    .update({ upsells: [...upsells, { ...upsell, at: new Date().toISOString() }] })
    .eq('stripe_session_id', sessionId);
}
