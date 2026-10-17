'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { track } from '@/lib/analytics';
import { goTo } from '@/lib/browser';
import { useT } from '@/lib/hooks';
import { price as priceOf } from '@/lib/products';
import { GlowButton } from '../ui/GlowButton';

type Kind = 'kit6' | 'subscription';

const NEXT: Record<Kind, string> = { kit6: '/upsell-2', subscription: '/thank-you' };

/**
 * Post-purchase 1-click offer. The exact charge (and, for the subscription, that it
 * recurs until cancelled) is stated right above the button, before any click.
 */
export function UpsellOffer({ kind }: { kind: Kind }) {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session_id') ?? '';
  const { d, f, m, currency } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = kind === 'kit6' ? d.upsell1 : d.upsell2;
  // Same currency as the order (the visitor's country), from the table Stripe charges from.
  const price = m(priceOf(kind === 'kit6' ? 'upsellKit6' : 'upsellSub', currency));
  const full = m(priceOf('kit3', currency));
  const next = `${NEXT[kind]}?session_id=${encodeURIComponent(sessionId)}`;

  const accept = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, offer: kind }),
      });
      const data = (await res.json()) as { status?: string; next?: string; url?: string };
      if (data.status === 'succeeded') {
        track('upsell_accepted', { offer: kind });
        router.push(data.next ?? next);
      } else if (data.status === 'requires_action' && data.url) {
        setError(d.upsell.action);
        goTo(data.url);
      } else {
        throw new Error();
      }
    } catch {
      setError(d.upsell.error);
      setBusy(false);
    }
  };

  return (
    <main className="screen flex items-center justify-center bg-quiz-gradient px-gutter text-cream">
      <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="w-full max-w-lg py-10 text-center">
        <p className="mb-4 font-display tracking-[0.3em] text-gold-soft">{d.common.brand}</p>
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-5 text-lg text-cream/85">{f(copy.body, { price, full })}</p>
        <p className="my-8 flex flex-wrap items-baseline justify-center gap-x-1 font-mono text-4xl text-gold sm:text-5xl">
          <span className="whitespace-nowrap">{price}</span>
          {kind === 'subscription' && <span className="text-xl text-gold-soft">{d.offer.pricing.perMonth}</span>}
        </p>
        <p className="mb-4 rounded-xl bg-cream/10 p-3 text-sm">{f(copy.charge, { price })}</p>
        {error && (
          <p role="alert" className="mb-4 text-sm text-coral-soft">
            {error}
          </p>
        )}
        <GlowButton className="w-full" onClick={accept} disabled={busy || !sessionId}>
          {busy ? d.upsell.processing : f(copy.accept, { price })}
        </GlowButton>
        <button onClick={() => router.push(next)} disabled={busy} className="mt-4 min-h-[44px] px-3 text-sm text-cream/80 underline underline-offset-4">
          {copy.decline}
        </button>
      </motion.div>
    </main>
  );
}
