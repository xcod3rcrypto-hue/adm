'use client';

import { useT } from '@/lib/hooks';
import { PLANS, intervalKey, price, savingsPct } from '@/lib/products';
import type { PlanId } from '@/lib/quiz';
import { useFunnel } from '@/lib/store';
import { GlowButton } from '../ui/GlowButton';
import { PurchaseToggle } from '../ui/PurchaseToggle';
import { TiltCard } from '../ui/TiltCard';
import { useOffer } from './context';
import { ShippingPerks } from '../ui/ShippingPerks';

const ORDER: PlanId[] = ['single', 'kit3', 'kit6'];

export function PricingCards() {
  const { d, f, m, currency } = useT();
  const { recommended, choosePlan } = useOffer();
  const subscribe = useFunnel((s) => s.subscribe);
  const p = d.offer.pricing;

  return (
    // pb-safe: when the section's end rests at the bottom of the screen (scroll snap), the last button
    // still clears the chat button above the home indicator / cookie banner.
    <section id="pricing" className="section scroll-mt-8 pb-safe [--pb:4rem] sm:[--pb:5rem]">
      <h2 className="h2 mb-6 text-center">{p.title}</h2>
      <PurchaseToggle className="mx-auto mb-4" />
      <ShippingPerks className="mb-10" />
      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {ORDER.map((id) => {
          const plan = PLANS[id];
          // Shown in the visitor's currency: the same table Stripe charges from.
          const amount = price(id, currency);
          const isRec = id === recommended;
          const save = savingsPct(plan, currency);
          return (
            <TiltCard key={id} className={`min-w-0 ${isRec ? 'md:-mt-4' : ''}`}>
              <div
                className={`card relative flex h-full flex-col p-6 md:p-5 lg:p-6 ${isRec ? 'border-2 border-gold pt-8 shadow-[0_20px_60px_rgba(212,175,55,0.25)] md:pt-8 lg:pt-8' : ''}`}
              >
                {isRec && (
                  // May wrap to two lines in long languages; the card's pt-8 keeps it off the heading.
                  <span className="absolute -top-3 left-1/2 w-max max-w-[calc(100%-1rem)] -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-center text-xs font-bold uppercase tracking-wide text-ink">
                    {p.recommended}
                  </span>
                )}
                <h3 className="font-display text-2xl">{p.plans[id].name}</h3>
                <p className="muted mt-1 text-sm">{p.plans[id].desc}</p>
                {/* Amount and "/month" wrap as two pieces; the amount itself never breaks. */}
                <p className="mt-6 flex flex-wrap items-baseline gap-x-1 font-mono text-4xl md:text-2xl lg:text-4xl">
                  <span className="whitespace-nowrap">{m(amount)}</span>
                </p>
                <p className="muted mt-1 text-sm">{f(p.perUnit, { price: m(Math.round(amount / plan.units)) })}</p>
                {save > 0 && (
                  <span className="mt-3 inline-block w-fit rounded-full bg-coral px-3 py-1 text-xs font-bold text-ink">
                    {f(p.save, { pct: save })}
                  </span>
                )}
                {subscribe && (
                  <p className="muted mt-4 text-xs">{f(p.recurring, { price: m(amount), interval: p.interval[intervalKey(plan)] })}</p>
                )}
                <div className="flex-1" />
                <GlowButton variant={isRec ? 'gold' : 'dark'} className="mt-6 w-full" onClick={() => choosePlan(id)}>
                  {p.cta}
                </GlowButton>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}
