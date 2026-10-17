'use client';

import { useMarket, useT } from '@/lib/hooks';
import { prioritizedFaq } from '@/lib/quiz';
import { useOffer } from './context';

/** Accordion ordered by the objections the quiz suggests this visitor has. */
export function SmartFAQ() {
  const { d } = useT();
  const { answers } = useOffer();
  const { fastDelivery } = useMarket();
  const items = d.offer.faq.items as Record<string, { q: string; a: string; aStandard?: string }>;
  return (
    <section className="section">
      <h2 className="h2 mb-8 text-center">{d.offer.faq.title}</h2>
      <div className="mx-auto max-w-3xl space-y-3">
        {prioritizedFaq(answers).map((key, i) => {
          const item = items[key];
          if (!item) return null;
          return (
            <details key={key} open={i === 0} className="card group">
              {/* The whole row is the tap target (≥ 44px), not just the question text. */}
              <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden className="shrink-0 text-xl text-gold-deep transition group-open:rotate-45 dark:text-gold">
                  +
                </span>
              </summary>
              <p className="muted px-5 pb-5 leading-relaxed">{key === 'shipping' && !fastDelivery && item.aStandard ? item.aStandard : item.a}</p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
