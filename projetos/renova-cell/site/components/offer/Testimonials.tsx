'use client';

import { TESTIMONIALS } from '@/content/proof';
import { useT } from '@/lib/hooks';
import { useOffer } from './context';

/** Infinite marquee of real testimonials, people like the visitor first. Hidden when empty. */
export function Testimonials() {
  const { d } = useT();
  const { answers } = useOffer();
  if (TESTIMONIALS.length === 0) return null;

  const score = (t: (typeof TESTIMONIALS)[number]) => (t.gender === answers.gender ? 2 : 0) + (t.age === answers.age ? 1 : 0);
  const sorted = [...TESTIMONIALS].sort((a, b) => score(b) - score(a));
  const loop = [...sorted, ...sorted];

  return (
    <section className="section overflow-hidden">
      <h2 className="h2 mb-8 text-center">{d.offer.testimonials.title}</h2>
      {/* Marquee clipped by the section; with reduced motion it becomes a plain swipeable row. */}
      <div className="group relative motion-reduce:-mx-gutter motion-reduce:overflow-x-auto motion-reduce:px-gutter">
        <ul className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {loop.map((t, i) => (
            <li key={`${t.name}-${i}`} aria-hidden={i >= sorted.length} className={`card w-[min(20rem,80vw)] shrink-0 p-6 ${i >= sorted.length ? 'motion-reduce:hidden' : ''}`}>
              <p className="mb-4">“{t.quote}”</p>
              <p className="text-sm font-semibold">
                {t.name} · <span className="muted font-normal">{t.city}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
      <p className="muted mt-4 text-center text-xs">{d.offer.testimonials.note}</p>
    </section>
  );
}
