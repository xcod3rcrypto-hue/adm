'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { useHydrated, useT } from '@/lib/hooks';
import { ORDER_BUMP, PLANS, money } from '@/lib/products';
import { parseAnswers, recommendedPlan, type PlanId } from '@/lib/quiz';
import { useFunnel } from '@/lib/store';
import { GlowButton } from '../ui/GlowButton';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function CheckoutFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { d, f, locale } = useT();
  const state = useFunnel();
  const [step, setStep] = useState(0);
  const [couponInput, setCouponInput] = useState('');
  const [couponState, setCouponState] = useState<{ valid: boolean; pct?: number } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answers = parseAnswers(state.answers);
  const planId: PlanId = state.plan ?? (answers ? recommendedPlan(answers) : 'kit3');
  const plan = PLANS[planId];
  const c = d.checkout;

  useEffect(() => {
    if (!hydrated) return;
    setName(state.contact.name);
    setEmail(state.contact.email);
    setNewsletter(state.contact.marketingConsent);
    if (state.coupon) {
      setCouponInput(state.coupon);
      void applyCoupon(state.coupon);
    }
    track('begin_checkout', { plan: planId, value: plan.amount / 100, currency: 'USD' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function applyCoupon(code: string) {
    const res = await fetch('/api/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { valid?: boolean; percentOff?: number | null } | null;
    if (data?.valid) {
      setCouponState({ valid: true, pct: data.percentOff ?? undefined });
      state.setCoupon(code.toUpperCase());
    } else {
      setCouponState({ valid: false });
      state.setCoupon(null);
    }
  }

  const subtotal = plan.amount + (state.bump ? ORDER_BUMP.amount : 0);
  const discount = couponState?.valid && couponState.pct ? Math.round((plan.amount * couponState.pct) / 100) : 0;

  const pay = async () => {
    setPaying(true);
    setError(null);
    state.setContact({ name, email });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          bump: state.bump,
          coupon: state.coupon,
          email,
          name,
          newsletter,
          quizId: state.quizId,
          locale,
        }),
      });
      const data = (await res.json()) as { url?: string };
      if (!res.ok || !data.url) throw new Error();
      window.location.assign(data.url);
    } catch {
      setError(c.payment.error);
      setPaying(false);
    }
  };

  if (!hydrated) return <div className="min-h-[100dvh]" />;

  const input = 'min-h-[52px] w-full rounded-xl border border-[var(--line)] bg-transparent px-4 text-lg';

  return (
    <main className="mx-auto min-h-[100dvh] max-w-xl px-4 py-8">
      <button onClick={() => (step ? setStep(step - 1) : router.push('/offer'))} className="muted mb-4 min-h-[44px] text-sm">
        ← {d.common.back}
      </button>
      <ol className="mb-8 flex gap-2" aria-label="Checkout steps">
        {c.steps.map((label, i) => (
          <li key={label} aria-current={i === step ? 'step' : undefined} className="flex-1">
            <div className={`mb-2 h-1.5 rounded-full ${i <= step ? 'bg-gold' : 'bg-[var(--line)]'}`} />
            <span className={`text-xs ${i === step ? 'font-semibold' : 'muted'}`}>
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.section key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
          {step === 0 && (
            <div className="space-y-5">
              <h1 className="h2">{c.cart.title}</h1>
              <div className="card space-y-2 p-5">
                {(Object.keys(PLANS) as PlanId[]).map((id) => (
                  <label key={id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl p-3 ${id === planId ? 'bg-gold/15' : ''}`}>
                    <span className="flex items-center gap-3">
                      <input type="radio" name="plan" checked={id === planId} onChange={() => state.setPlan(id)} className="h-5 w-5 accent-[#0E5C4A]" />
                      <span className="flex flex-col items-start gap-1">
                        <span className="font-semibold">{d.offer.pricing.plans[id].name}</span>
                        {answers && id === recommendedPlan(answers) && (
                          <span className="whitespace-nowrap rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                            {d.offer.pricing.recommended}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="font-mono">
                      {money(PLANS[id].amount, locale)}
                      {PLANS[id].recurring ? d.offer.pricing.perMonth : ''}
                    </span>
                  </label>
                ))}
                {plan.recurring && <p className="muted px-3 text-xs">{f(d.offer.pricing.recurring, { price: money(plan.amount, locale) })}</p>}
              </div>

              <label className="flex cursor-pointer gap-4 rounded-2xl border-2 border-dashed border-coral bg-coral/10 p-5">
                <input type="checkbox" checked={state.bump} onChange={(e) => state.setBump(e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[#FF6B5A]" />
                <span>
                  <span className="block font-semibold">{f(c.cart.bumpTitle, { price: money(ORDER_BUMP.amount, locale) })}</span>
                  <span className="muted text-sm">{c.cart.bumpBody}</span>
                </span>
              </label>

              <div>
                <label htmlFor="coupon" className="mb-2 block text-sm font-semibold">
                  {c.cart.coupon}
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={c.cart.couponPlaceholder}
                    className={`${input} uppercase`}
                  />
                  <button
                    onClick={() => couponInput.trim() && applyCoupon(couponInput.trim())}
                    className="rounded-xl bg-ink px-5 font-semibold text-cream dark:bg-cream dark:text-ink"
                  >
                    {c.cart.apply}
                  </button>
                </div>
                <p className="mt-2 text-sm" aria-live="polite">
                  {couponState?.valid ? (
                    <span className="text-emerald-brand dark:text-gold">🎉 {f(c.cart.valid, { pct: couponState.pct ?? '' })}</span>
                  ) : couponState ? (
                    <span className="text-coral">{c.cart.invalid}</span>
                  ) : (
                    <span className="muted">🎁 {c.cart.hint}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--line)] pt-4 text-lg">
                <span>{c.cart.total}</span>
                <span className="font-mono text-2xl">
                  {discount > 0 && <s className="muted mr-2 text-base">{money(subtotal, locale)}</s>}
                  {money(subtotal - discount, locale)}
                </span>
              </div>
              {discount > 0 && <p className="muted -mt-3 text-right text-xs">{c.cart.discountNote}</p>}
              <GlowButton className="w-full" onClick={() => setStep(1)}>
                {d.common.continue} →
              </GlowButton>
            </div>
          )}

          {step === 1 && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim() || !EMAIL_RE.test(email)) return setError(`${c.info.name} / ${c.info.email}`);
                setError(null);
                setStep(2);
              }}
            >
              <h1 className="h2">{c.info.title}</h1>
              <input className={input} placeholder={c.info.name} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-label={c.info.name} required />
              <input className={input} type="email" placeholder={c.info.email} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label={c.info.email} required />
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#0E5C4A]" />
                {c.info.newsletter}
              </label>
              <p className="muted text-sm">📦 {c.info.addressNote}</p>
              {error && (
                <p role="alert" className="text-sm text-coral">
                  ⚠ {error}
                </p>
              )}
              <GlowButton type="submit" className="w-full">
                {d.common.continue} →
              </GlowButton>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h1 className="h2">{c.payment.title}</h1>
              <p>{c.payment.body}</p>
              <p className="muted text-sm">{c.payment.installments}</p>
              <div className="card flex items-center justify-between p-5 text-lg">
                <span>{c.cart.total}</span>
                <span className="font-mono text-2xl">{money(subtotal - discount, locale)}</span>
              </div>
              {error && (
                <p role="alert" className="text-sm text-coral">
                  ⚠ {error}
                </p>
              )}
              <GlowButton className="w-full" onClick={pay} disabled={paying}>
                🔒 {paying ? c.payment.redirecting : c.payment.pay}
              </GlowButton>
              <ul className="muted grid grid-cols-3 gap-2 text-center text-xs">
                <li className="card p-3">🔐 {c.payment.ssl}</li>
                <li className="card p-3">🛡️ {c.payment.guarantee}</li>
                <li className="card p-3">💳 {c.payment.stripe}</li>
              </ul>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </main>
  );
}
