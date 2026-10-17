'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useT } from '@/lib/hooks';
import { TiltCard } from '../ui/TiltCard';

/**
 * Three flip cards: finding on the front, citation (with DOI/PMID link) on the back.
 * Both faces share one grid cell, so a card is as tall as its longest face in any language
 * (no fixed height to overflow). Each face has its own full-size flip button; the face that
 * is turned away is hidden from screen readers and the tab order.
 */
export function ScienceCards() {
  const { d } = useT();
  const [flipped, setFlipped] = useState<number | null>(null);
  return (
    <section className="section">
      <h2 className="h2 mb-2 text-center">{d.offer.science.title}</h2>
      <p className="muted mb-8 text-center text-sm">{d.offer.science.flip}</p>
      <div className="grid gap-5 md:grid-cols-3">
        {d.offer.science.cards.map((card, i) => {
          const isFlipped = flipped === i;
          const flip = () => setFlipped(isFlipped ? null : i);
          return (
            <TiltCard key={card.ref} className="[perspective:1000px]">
              <motion.div
                className="grid h-full [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  aria-hidden={isFlipped}
                  className="card relative col-start-1 row-start-1 flex min-h-[16rem] flex-col p-6 [backface-visibility:hidden]"
                >
                  <span className="mb-2 font-mono text-xs uppercase tracking-widest text-emerald-brand dark:text-gold">0{i + 1}</span>
                  <h3 className="mb-3 font-display text-2xl">{card.title}</h3>
                  <p className="text-sm leading-relaxed">{card.finding}</p>
                  <button
                    type="button"
                    onClick={flip}
                    aria-pressed={isFlipped}
                    aria-label={`${card.title}: ${d.offer.science.flip}`}
                    tabIndex={isFlipped ? -1 : 0}
                    className="absolute inset-0 rounded-2xl"
                  />
                </div>
                <div
                  aria-hidden={!isFlipped}
                  className="relative col-start-1 row-start-1 flex min-h-[16rem] flex-col justify-center rounded-2xl bg-emerald-brand p-6 text-cream [backface-visibility:hidden] [transform:rotateY(180deg)]"
                >
                  <p className="font-display text-xl">{card.source}</p>
                  <a
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isFlipped ? 0 : -1}
                    className="relative z-10 mt-3 inline-flex min-h-[44px] items-center self-start font-mono text-sm text-gold-soft underline underline-offset-4 [overflow-wrap:anywhere]"
                  >
                    {card.ref} ↗
                  </a>
                  <button
                    type="button"
                    onClick={flip}
                    aria-pressed={isFlipped}
                    aria-label={`${card.title}: ${d.offer.science.flip}`}
                    tabIndex={isFlipped ? 0 : -1}
                    className="absolute inset-0 rounded-2xl"
                  />
                </div>
              </motion.div>
            </TiltCard>
          );
        })}
      </div>
      <p className="muted mx-auto mt-6 max-w-2xl text-center text-xs">{d.offer.science.note}</p>
    </section>
  );
}
