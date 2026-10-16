'use client';

import { useT } from '@/lib/hooks';
import { prioritizedFaq } from '@/lib/quiz';
import { useOffer } from './context';

/** Accordion ordered by the objections the quiz suggests this visitor has. */
export function SmartFAQ() {
  const { d } = useT();
  const { answers } = useOffer();
  const items = d.offer.faq.items as Record<string, { q: string; a: string }>;
  return (
    <section className="section">
      <h2 className="h2 mb-8 text-center">{d.offer.faq.title}</h2>
      <div className="mx-auto max-w-3xl space-y-3">
        {prioritizedFaq(answers).map((key, i) => {
          const item = items[key];
          if (!item) return null;
          return (
            <details key={key} open={i === 0} className="card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {item.q}
                <span aria-hidden className="text-xl text-gold transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="muted mt-3 leading-relaxed">{item.a}</p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
