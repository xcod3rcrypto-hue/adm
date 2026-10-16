'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { track } from '@/lib/analytics';
import { useT } from '@/lib/hooks';
import { UPSELL_KIT6, UPSELL_SUBSCRIPTION, money } from '@/lib/products';
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
  const { d, f, locale } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = kind === 'kit6' ? d.upsell1 : d.upsell2;
  const price = money(kind === 'kit6' ? UPSELL_KIT6.amount : UPSELL_SUBSCRIPTION.amount, locale);
  const full = money(UPSELL_SUBSCRIPTION.full, locale);
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
        window.location.assign(data.url);
      } else {
        throw new Error();
      }
    } catch {
      setError(d.upsell.error);
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-quiz-gradient px-4 py-10 text-cream">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center">
        <p className="mb-4 font-display tracking-[0.3em] text-gold">{d.common.brand}</p>
        <h1 className="font-display text-4xl leading-tight">{copy.title}</h1>
        <p className="mt-5 text-lg text-cream/85">{f(copy.body, { price, full })}</p>
        <p className="my-8 font-mono text-5xl text-gold">
          {price}
          {kind === 'subscription' && <span className="text-xl">{d.offer.pricing.perMonth}</span>}
        </p>
        <p className="mb-4 rounded-xl bg-cream/10 p-3 text-sm">{f(copy.charge, { price })}</p>
        {error && (
          <p role="alert" className="mb-4 text-sm text-coral">
            {error}
          </p>
        )}
        <GlowButton className="w-full" onClick={accept} disabled={busy || !sessionId}>
          {busy ? d.upsell.processing : f(copy.accept, { price })}
        </GlowButton>
        <button onClick={() => router.push(next)} disabled={busy} className="mt-4 min-h-[44px] text-sm text-cream/70 underline underline-offset-4">
          {copy.decline}
        </button>
      </motion.div>
    </main>
  );
}
