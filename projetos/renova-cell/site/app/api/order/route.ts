import type { NextRequest } from 'next/server';
import { json } from '@/lib/http';
import { paidSession, recordOrder } from '@/lib/orders';

export const dynamic = 'force-dynamic';

/**
 * Minimal order summary for the upsell / thank-you pages. Also records the order
 * in case the webhook has not arrived yet (recordOrder is idempotent).
 */
export async function GET(req: NextRequest) {
  const session = await paidSession(req.nextUrl.searchParams.get('session_id'));
  if (!session) return json({ error: 'Not found' }, 404);
  if (!session.metadata?.upsell) await recordOrder(session);
  const firstName = (session.metadata?.name || session.customer_details?.name || '').split(' ')[0] ?? '';
  return json({
    plan: session.metadata?.plan ?? null,
    bump: session.metadata?.bump === 'true',
    amount: session.amount_total,
    currency: session.currency,
    firstName,
    mode: session.mode,
  });
}
