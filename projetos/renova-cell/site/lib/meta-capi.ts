import 'server-only';
import { createHash } from 'node:crypto';
import type Stripe from 'stripe';
import { EUROPE_COUNTRIES } from './products';

/**
 * Meta Conversions API: sends Purchase from the server (Stripe webhook), so Meta counts
 * purchases the browser pixel misses (ad blockers, closed tab, Safari). The browser sends the
 * same Purchase with eventID = the Checkout Session id, so Meta keeps one of the two.
 *
 * Consent: in Europe only visitors who accepted cookies are sent; elsewhere everyone except
 * those who declined. The decision is taken at checkout and stored in the session metadata.
 */
const EUROPE = new Set(EUROPE_COUNTRIES);
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v24.0';

export type Consent = 'granted' | 'denied' | null;

export function capiAllowed(consent: Consent, country: string): boolean {
  if (consent === 'granted') return true;
  if (consent === 'denied') return false;
  return Boolean(country) && !EUROPE.has(country);
}

/** Click data for the session metadata (Stripe limits values to 500 characters). */
export function capiMetadata(input: {
  cookies: { get(name: string): { value: string } | undefined };
  headers: Headers;
  fbclid?: string;
  landedAt?: number;
}): Record<string, string> {
  const fbp = input.cookies.get('_fbp')?.value;
  const fbc =
    input.cookies.get('_fbc')?.value ?? (input.fbclid ? `fb.1.${input.landedAt ?? Date.now()}.${input.fbclid}` : undefined);
  const ip = input.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || input.headers.get('x-real-ip') || undefined;
  const ua = input.headers.get('user-agent') ?? undefined;
  const out: Record<string, string> = { capi: '1' };
  if (fbp) out.fbp = fbp.slice(0, 500);
  if (fbc) out.fbc = fbc.slice(0, 500);
  if (ip) out.ip = ip.slice(0, 100);
  if (ua) out.ua = ua.slice(0, 500);
  return out;
}

const sha = (value: string | null | undefined) =>
  value ? [createHash('sha256').update(value.trim().toLowerCase()).digest('hex')] : undefined;

export function capiConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID && process.env.META_CAPI_TOKEN);
}

/** Sends one Purchase for a paid Checkout Session. Never throws (the webhook must still answer 200). */
export async function sendMetaPurchase(session: Stripe.Checkout.Session): Promise<void> {
  const md = session.metadata ?? {};
  if (md.capi !== '1' || !capiConfigured() || session.amount_total == null) return;

  const details = session.customer_details;
  const [first, ...rest] = (details?.name ?? '').trim().split(/\s+/);
  const phone = details?.phone?.replace(/\D/g, '');
  const event = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: session.id,
    action_source: 'website',
    event_source_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/checkout`,
    user_data: {
      em: sha(details?.email ?? session.customer_email),
      ph: sha(phone),
      fn: sha(first),
      ln: sha(rest.join(' ')),
      ct: sha(details?.address?.city?.replace(/\s/g, '')),
      zp: sha(details?.address?.postal_code?.replace(/\s/g, '')),
      country: sha(details?.address?.country),
      external_id: sha(md.quiz_id),
      fbc: md.fbc,
      fbp: md.fbp,
      client_ip_address: md.ip,
      client_user_agent: md.ua,
    },
    custom_data: {
      currency: (session.currency ?? 'usd').toUpperCase(),
      value: session.amount_total / 100,
      content_ids: [md.plan ?? 'unknown'],
      content_type: 'product',
      order_id: session.id,
    },
  };

  const body: Record<string, unknown> = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.NEXT_PUBLIC_META_PIXEL_ID}/events?access_token=${encodeURIComponent(process.env.META_CAPI_TOKEN ?? '')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) console.error('meta capi failed', res.status, (await res.text()).slice(0, 300));
  } catch (error) {
    console.error('meta capi failed', error);
  }
}
