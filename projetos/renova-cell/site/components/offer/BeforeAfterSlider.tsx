'use client';

import Image from 'next/image';
import { useState } from 'react';
import { BEFORE_AFTER } from '@/content/proof';
import { useT } from '@/lib/hooks';

/** Draggable comparison. Renders nothing until real, consented photos exist in content/proof.ts. */
export function BeforeAfterSlider() {
  const { d } = useT();
  const [pos, setPos] = useState(50);
  const item = BEFORE_AFTER[0];
  if (!item) return null;
  return (
    <section className="section">
      <h2 className="h2 mb-8 text-center">{d.offer.beforeAfter.title}</h2>
      <figure className="mx-auto max-w-xl">
        <div className="relative aspect-square overflow-hidden rounded-2xl">
          <Image src={item.after} alt={d.offer.beforeAfter.after} fill className="object-cover" sizes="(max-width: 640px) 100vw, 576px" />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Image src={item.before} alt={d.offer.beforeAfter.before} fill className="object-cover" sizes="(max-width: 640px) 100vw, 576px" />
          </div>
          <div aria-hidden className="absolute inset-y-0 w-1 bg-gold" style={{ left: `${pos}%` }} />
          <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-xs text-cream">{d.offer.beforeAfter.before}</span>
          <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-xs text-cream">{d.offer.beforeAfter.after}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label={`${d.offer.beforeAfter.before} / ${d.offer.beforeAfter.after}`}
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
        <figcaption className="muted mt-3 text-center text-sm">
          {item.caption} — {d.offer.beforeAfter.note}
        </figcaption>
      </figure>
    </section>
  );
}
