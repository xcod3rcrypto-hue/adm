/**
 * Simulated backend for the demo build. It answers the same routes as app/api/*
 * with the same response shapes, but nothing is saved, charged or sent.
 */
import { PLANS, UPSELL_KIT6, UPSELL_SUBSCRIPTION } from '../lib/products';
import type { PlanId } from '../lib/quiz';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CHAT_REPLY: Record<string, string> = {
  pt: 'Esta é uma demonstração. No site publicado, eu (Elena, assistente de IA) respondo aqui em tempo real, sem fazer afirmações médicas e indicando falar com um médico quando for o caso.',
  en: 'This is a demo. On the live site I (Elena, the AI assistant) answer here in real time, without medical claims, and suggest talking to a doctor when that applies.',
  es: 'Esto es una demostración. En el sitio publicado, yo (Elena, asistente de IA) respondo aquí en tiempo real, sin afirmaciones médicas.',
  fr: "Ceci est une démo. Sur le site publié, je (Elena, assistante IA) réponds ici en temps réel, sans allégations médicales.",
  de: 'Das ist eine Demo. Auf der echten Seite antworte ich (Elena, KI-Assistentin) hier in Echtzeit, ohne medizinische Versprechen.',
};

let lastOrder: { plan: PlanId; bump: boolean; name: string; amount: number; upsells: number } | null = null;

async function handle(path: string, init?: RequestInit): Promise<Response> {
  const url = new URL(path, 'https://demo.local');
  const body = init?.body ? JSON.parse(String(init.body)) : {};

  switch (url.pathname) {
    case '/api/geo':
      return json({ country: null, locale: 'pt' });
    case '/api/quiz':
      if ((init?.method ?? 'GET') === 'GET') return json({ error: 'Not found' }, 404);
      await wait(700);
      return json({ id: null, headline: null });
    case '/api/headline':
      return json({ headline: null });
    case '/api/heygen':
      return json({ url: null });
    case '/api/social-proof':
      return json({ count: 0 });
    case '/api/coupon':
      await wait(300);
      return json(String(body.code).toUpperCase() === 'RENOVA10' ? { valid: true, percentOff: 10, amountOff: null } : { valid: false });
    case '/api/checkout': {
      await wait(900);
      const plan = (body.plan as PlanId) in PLANS ? (body.plan as PlanId) : 'kit3';
      const discount = String(body.coupon ?? '').toUpperCase() === 'RENOVA10' ? Math.round(PLANS[plan].amount * 0.1) : 0;
      const amount = PLANS[plan].amount - discount + (body.bump ? 1990 : 0);
      lastOrder = { plan, bump: Boolean(body.bump), name: String(body.name ?? ''), amount, upsells: 0 };
      const next = PLANS[plan].recurring ? '/thank-you' : '/upsell-1';
      return json({ url: `${next}?session_id=cs_test_demo` });
    }
    case '/api/upsell': {
      await wait(800);
      if (lastOrder) lastOrder.upsells += body.offer === 'kit6' ? UPSELL_KIT6.amount : UPSELL_SUBSCRIPTION.amount;
      const next = body.offer === 'kit6' ? '/upsell-2' : '/thank-you';
      return json({ status: 'succeeded', next: `${next}?session_id=cs_test_demo` });
    }
    case '/api/order':
      if (!lastOrder) return json({ error: 'Not found' }, 404);
      return json({
        plan: lastOrder.plan,
        bump: lastOrder.bump,
        amount: lastOrder.amount + lastOrder.upsells,
        currency: 'usd',
        firstName: lastOrder.name.split(' ')[0] ?? '',
        mode: PLANS[lastOrder.plan].recurring ? 'subscription' : 'payment',
      });
    case '/api/chat': {
      const text = CHAT_REPLY[String(body.locale)] ?? CHAT_REPLY.en!;
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          for (const word of text.split(/(?<= )/)) {
            controller.enqueue(encoder.encode(word));
            await wait(35);
          }
          controller.close();
        },
      });
      await wait(400);
      return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
    default:
      return json({ error: 'Not found' }, 404);
  }
}

export function installMockApi(): void {
  const realFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const href = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    return href.startsWith('/api/') ? handle(href, init) : realFetch(input, init);
  };
}
