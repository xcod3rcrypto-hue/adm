'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { usePrefersReducedMotion, useT } from '@/lib/hooks';
import { GlowButton } from '../ui/GlowButton';
import { scrollToPricing, useOffer } from './context';

/** Headline from Claude (variant A) or the static persona headline (variant B / fallback). */
export function DynamicHero() {
  const { d } = useT();
  const { headline, persona } = useOffer();
  const reduced = usePrefersReducedMotion();
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: (i * 37) % 100,
        size: 2 + ((i * 7) % 5),
        delay: (i % 7) * 0.6,
        duration: 6 + (i % 5),
      })),
    [],
  );

  return (
    <section className="relative isolate overflow-hidden bg-ink px-4 pb-20 pt-16 text-cream sm:pt-24">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(14,92,74,0.7),transparent_60%)]" />
      {!reduced &&
        particles.map((p, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute bottom-0 -z-10 rounded-full bg-gold/70"
            style={{ left: `${p.left}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -520], opacity: [0, 1, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-5 font-display tracking-[0.3em] text-gold">{d.common.brand}</p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl leading-tight sm:text-6xl sm:leading-[1.1]"
        >
          {headline || d.offer.hero.fallback[persona]}
        </motion.h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-cream/80">{d.offer.hero.sub}</p>
        <GlowButton className="mt-10" onClick={scrollToPricing}>
          {d.offer.hero.cta} →
        </GlowButton>
      </div>
    </section>
  );
}
