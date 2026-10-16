'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useT } from '@/lib/hooks';

/**
 * Shows the REAL number of paid orders in the last 24h (from Supabase), every 30s for 6s.
 * No invented names or cities, and nothing at all when there are no orders.
 */
export function LiveSocialProof() {
  const { d, f } = useT();
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch('/api/social-proof')
      .then((r) => r.json())
      .then((data: { count?: number }) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  useEffect(() => {
    if (count < 1) return;
    let hide: ReturnType<typeof setTimeout>;
    const show = () => {
      setVisible(true);
      hide = setTimeout(() => setVisible(false), 6000);
    };
    const first = setTimeout(show, 12000);
    const every = setInterval(show, 30000);
    return () => {
      clearTimeout(first);
      clearTimeout(hide);
      clearInterval(every);
    };
  }, [count]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="fixed bottom-24 left-4 z-30 max-w-[calc(100vw-6rem)] rounded-2xl bg-ink px-4 py-3 text-sm text-cream shadow-xl sm:bottom-6"
        >
          <span aria-hidden>🛍️ </span>
          {f(d.offer.social.ordered, { count })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
