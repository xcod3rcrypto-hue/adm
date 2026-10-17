'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/hooks';
import { GlowButton } from '../ui/GlowButton';
import { scrollToPricing } from './context';

/**
 * Phones only. Appears after 30% of the page has been scrolled, and steps aside while the
 * pricing cards are on screen (their own buttons are the CTA there) and near the very end.
 * Its height is published as --sticky-h so the chat button and toast float above it.
 */
export function StickyCTA() {
  const { d } = useT();
  const { scrollYProgress } = useScroll();
  const [past, setPast] = useState(false);
  const [pricingInView, setPricingInView] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setPast(v > 0.3 && v < 0.97));

  useEffect(() => {
    const pricing = document.getElementById('pricing');
    if (!pricing) return;
    const io = new IntersectionObserver(([entry]) => setPricingInView(Boolean(entry?.isIntersecting)));
    io.observe(pricing);
    return () => io.disconnect();
  }, []);

  const visible = past && !pricingInView;

  useEffect(() => {
    const el = bar.current;
    const root = document.documentElement;
    if (!visible || !el) {
      root.style.removeProperty('--sticky-h');
      return;
    }
    // offsetHeight is 0 while the bar is display:none (sm:hidden, or while the chat is open).
    const update = () => root.style.setProperty('--sticky-h', `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--sticky-h');
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={bar}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'tween', duration: 0.25 }}
          className="sticky-cta z-40 border-t border-[var(--line)] sm:hidden"
        >
          <GlowButton className="w-full" onClick={scrollToPricing}>
            {d.offer.sticky.cta} →
          </GlowButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
