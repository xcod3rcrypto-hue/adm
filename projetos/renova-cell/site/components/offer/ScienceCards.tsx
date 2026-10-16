'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useT } from '@/lib/hooks';
import { TiltCard } from '../ui/TiltCard';

/** Three flip cards: finding on the front, citation (with DOI/PMID link) on the back. */
export function ScienceCards() {
  const { d } = useT();
  const [flipped, setFlipped] = useState<number | null>(null);
  return (
    <section className="section">
      <h2 className="h2 mb-2 text-center">{d.offer.science.title}</h2>
      <p className="muted mb-8 text-center text-sm">{d.offer.science.flip}</p>
      <div className="grid gap-5 sm:grid-cols-3">
        {d.offer.science.cards.map((card, i) => {
          const isFlipped = flipped === i;
          return (
            <TiltCard key={card.ref}>
              <button
                onClick={() => setFlipped(isFlipped ? null : i)}
                aria-pressed={isFlipped}
                className="relative block h-72 w-full text-left [perspective:1000px]"
              >
                <motion.div
                  className="relative h-full w-full [transform-style:preserve-3d]"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="card absolute inset-0 flex flex-col p-6 [backface-visibility:hidden]">
                    <span className="mb-2 font-mono text-xs uppercase tracking-widest text-emerald-brand dark:text-gold">
                      0{i + 1}
                    </span>
                    <h3 className="mb-3 font-display text-2xl">{card.title}</h3>
                    <p className="text-sm leading-relaxed">{card.finding}</p>
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-center rounded-2xl bg-emerald-brand p-6 text-cream [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="font-display text-xl">{card.source}</p>
                    <a
                      href={card.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-4 font-mono text-sm text-gold underline underline-offset-4"
                    >
                      {card.ref} ↗
                    </a>
                  </div>
                </motion.div>
              </button>
            </TiltCard>
          );
        })}
      </div>
      <p className="muted mx-auto mt-6 max-w-2xl text-center text-xs">{d.offer.science.note}</p>
    </section>
  );
}
