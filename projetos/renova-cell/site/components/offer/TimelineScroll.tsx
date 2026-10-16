'use client';

import { useT } from '@/lib/hooks';

/** Horizontal snap timeline: Day 1 → 5 → 15 → 30 → 90. */
export function TimelineScroll() {
  const { d } = useT();
  return (
    <section className="section">
      <h2 className="h2 mb-8 text-center">{d.offer.timeline.title}</h2>
      <ol className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin]" tabIndex={0}>
        {d.offer.timeline.steps.map((s, i) => (
          <li key={s.day} className="card relative w-[78%] shrink-0 snap-center p-6 sm:w-[38%]">
            <span className="font-mono text-sm text-emerald-brand dark:text-gold">{s.day}</span>
            <h3 className="mt-2 font-display text-2xl">{s.title}</h3>
            <p className="muted mt-3 text-sm">{s.body}</p>
            <div aria-hidden className="mt-6 h-1 rounded-full bg-gradient-to-r from-gold to-transparent" style={{ width: `${20 + i * 20}%` }} />
          </li>
        ))}
      </ol>
    </section>
  );
}
