'use client';

import { useT } from '@/lib/hooks';
import { PLANS, money, savingsPct } from '@/lib/products';
import type { PlanId } from '@/lib/quiz';
import { GlowButton } from '../ui/GlowButton';
import { TiltCard } from '../ui/TiltCard';
import { useOffer } from './context';

const ORDER: PlanId[] = ['single', 'kit3', 'kit6'];

export function PricingCards() {
  const { d, f, locale } = useT();
  const { recommended, choosePlan } = useOffer();
  const p = d.offer.pricing;

  return (
    <section id="pricing" className="section scroll-mt-8">
      <h2 className="h2 mb-10 text-center">{p.title}</h2>
      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {ORDER.map((id) => {
          const plan = PLANS[id];
          const isRec = id === recommended;
          const save = savingsPct(plan);
          return (
            <TiltCard key={id} className={isRec ? 'md:-mt-4' : ''}>
              <div
                className={`card relative flex h-full flex-col p-6 ${isRec ? 'border-2 border-gold shadow-[0_20px_60px_rgba(212,175,55,0.25)]' : ''}`}
              >
                {isRec && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-4 py-1 text-xs font-bold uppercase tracking-wider text-ink">
                    {p.recommended}
                  </span>
                )}
                <h3 className="font-display text-2xl">{p.plans[id].name}</h3>
                <p className="muted mt-1 text-sm">{p.plans[id].desc}</p>
                <p className="mt-6 font-mono text-4xl">
                  {money(plan.amount, locale)}
                  {plan.recurring && <span className="text-base">{p.perMonth}</span>}
                </p>
                <p className="muted mt-1 text-sm">{f(p.perUnit, { price: money(Math.round(plan.amount / plan.units), locale) })}</p>
                {save > 0 && (
                  <span className="mt-3 inline-block w-fit rounded-full bg-coral px-3 py-1 text-xs font-bold text-ink">
                    {f(p.save, { pct: save })}
                  </span>
                )}
                {plan.recurring && <p className="muted mt-4 text-xs">{f(p.recurring, { price: money(plan.amount, locale) })}</p>}
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
