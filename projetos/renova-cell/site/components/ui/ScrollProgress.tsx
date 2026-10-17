'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div aria-hidden className="pointer-events-none fixed inset-x-0 top-[var(--safe-t)] z-50 h-1 origin-left bg-gold" style={{ scaleX }} />;
}
