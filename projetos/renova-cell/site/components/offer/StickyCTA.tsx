'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';
import { useT } from '@/lib/hooks';
import { GlowButton } from '../ui/GlowButton';
import { scrollToPricing } from './context';

/** Appears after 30% of the page has been scrolled. */
export function StickyCTA() {
  const { d } = useT();
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setVisible(v > 0.3 && v < 0.97));
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--page-bg)]/95 p-3 backdrop-blur sm:hidden"
        >
          <GlowButton className="w-full" onClick={scrollToPricing}>
            {d.offer.sticky.cta} →
          </GlowButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
