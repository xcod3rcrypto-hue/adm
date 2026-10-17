import type Anthropic from '@anthropic-ai/sdk';
import type { NextRequest } from 'next/server';
import { chatStream } from '@/lib/claude';
import { badRequest, clientIp, json, localeOr, rateLimited, readJson } from '@/lib/http';
import { isFastDelivery } from '@/lib/market';
import { currencyForCountry } from '@/lib/products';
import type { Persona } from '@/lib/quiz';

export const dynamic = 'force-dynamic';

const PERSONAS: Persona[] = ['woman', 'man', 'senior'];

/** Streaming AI assistant. The client sends the visible conversation; we validate it hard. */
export async function POST(req: NextRequest) {
  if (await rateLimited(`chat:${clientIp(req)}`, 20, 60_000)) return json({ error: 'Too many requests' }, 429);
  const body = await readJson<{ messages?: unknown; locale?: unknown; persona?: unknown; plan?: unknown }>(req);
  if (!body || !Array.isArray(body.messages)) return badRequest('Invalid messages');

  // An odd count keeps the window starting on a user turn (the history always ends on one).
  const messages = body.messages.slice(-11);
  const valid =
    messages.length > 0 &&
    messages.every(
      (m: unknown, i: number) =>
        !!m &&
        typeof m === 'object' &&
        (m as { role?: unknown }).role === (i % 2 === 0 ? 'user' : 'assistant') &&
        typeof (m as { content?: unknown }).content === 'string' &&
        ((m as { content: string }).content.length ?? 0) > 0 &&
        (m as { content: string }).content.length <= 1000,
    ) &&
    (messages[messages.length - 1] as { role: string }).role === 'user';
  if (!valid) return badRequest('Invalid messages');

  const persona = PERSONAS.includes(body.persona as Persona) ? (body.persona as Persona) : undefined;
  const plan = typeof body.plan === 'string' ? body.plan.slice(0, 20) : undefined;
  const country = req.headers.get('x-vercel-ip-country');
  const currency = currencyForCountry(country);
  const stream = chatStream(messages as Anthropic.Beta.BetaMessageParam[], localeOr(body.locale), { persona, plan, currency, fastDelivery: isFastDelivery(country) });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
