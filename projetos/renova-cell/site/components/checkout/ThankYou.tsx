'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { useT } from '@/lib/hooks';
import { money } from '@/lib/products';
import { useFunnel } from '@/lib/store';
import { Footer } from '../ui/Footer';
import { GlowButton } from '../ui/GlowButton';

interface Order {
  plan: string | null;
  amount: number | null;
  currency: string | null;
  firstName: string;
}

const VIP_URL = process.env.NEXT_PUBLIC_VIP_GROUP_URL;
const VIDEO_URL = process.env.NEXT_PUBLIC_THANKYOU_VIDEO_URL;

export function ThankYou() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const { d, f, locale } = useT();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [referral, setReferral] = useState('');
  const t = d.thankYou;

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/order?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Order | null) => {
        if (!data) return;
        setOrder(data);
        // Fire Purchase once per order, even on reloads.
        const key = `rc_tracked_${sessionId}`;
        try {
          if (!sessionStorage.getItem(key)) {
            track('purchase', { value: (data.amount ?? 0) / 100, currency: (data.currency ?? 'usd').toUpperCase(), plan: data.plan ?? '' });
            sessionStorage.setItem(key, '1');
          }
        } catch {
          // ignore
        }
      })
      .catch(() => undefined);
    useFunnel.setState({ plan: null, bump: false, coupon: null, step: 0 });
  }, [sessionId]);

  useEffect(() => setReferral(`${window.location.origin}/quiz?utm_source=referral`), []);

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 py-14 text-center">
        <p className="text-6xl" aria-hidden>
          🎉
        </p>
        <h1 className="mt-4 font-display text-4xl">{f(t.title, { name: order?.firstName ? `, ${order.firstName}` : '' })}</h1>
        <p className="muted mt-3 text-lg">{t.body}</p>

        {order?.amount != null && (
          <div className="card mx-auto mt-8 max-w-sm p-5 text-left">
            <p className="mb-2 font-semibold">{t.order}</p>
            <p className="flex justify-between">
              <span>{order.plan && order.plan in d.offer.pricing.plans ? d.offer.pricing.plans[order.plan as 'kit3'].name : '—'}</span>
              <span className="font-mono">{money(order.amount, locale)}</span>
            </p>
          </div>
        )}

        {VIDEO_URL && <video src={VIDEO_URL} controls playsInline className="mt-10 aspect-video w-full rounded-2xl bg-ink" />}

        <section className="mt-12 text-left">
          <h2 className="h2 mb-5 text-center">{t.howTo}</h2>
          <ol className="space-y-3">
            {t.steps.map((s, i) => (
              <li key={s} className="card flex items-center gap-4 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-mono font-bold text-ink">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        {VIP_URL && (
          <section className="card mt-10 p-6">
            <h2 className="font-display text-2xl">👑 {t.vip.title}</h2>
            <p className="muted mt-2">{t.vip.body}</p>
            <a href={VIP_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-[52px] items-center rounded-full bg-emerald-brand px-7 font-semibold text-cream">
              {t.vip.cta}
            </a>
          </section>
        )}

        <section className="card mt-6 p-6">
          <h2 className="font-display text-2xl">💌 {t.referral.title}</h2>
          <p className="muted mt-2">{t.referral.body}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={referral} aria-label={t.referral.title} className="min-h-[52px] flex-1 rounded-xl border border-[var(--line)] bg-transparent px-4 text-sm" />
            <GlowButton
              variant="dark"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(referral);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  // clipboard blocked — the field is selectable
                }
              }}
            >
              {copied ? t.referral.copied : t.referral.copy}
            </GlowButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
