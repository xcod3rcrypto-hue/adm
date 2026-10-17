'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useT } from '@/lib/hooks';
import { useFunnel } from '@/lib/store';
import { GlowButton } from '../ui/GlowButton';
import { scrollToPricing } from './context';

const SEEN_KEY = 'rc_exit_seen';

/** Desktop exit-intent offer (mouse leaving through the top), shown once per visitor. */
export function ExitIntent() {
  const { d } = useT();
  const setCoupon = useFunnel((s) => s.setCoupon);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 0 || e.relatedTarget) return;
      try {
        if (localStorage.getItem(SEEN_KEY)) return;
        localStorage.setItem(SEEN_KEY, '1');
      } catch {
        // storage blocked: show at most once per page view
      }
      setOpen(true);
      document.removeEventListener('mouseout', onLeave);
    };
    const arm = setTimeout(() => document.addEventListener('mouseout', onLeave), 8000);
    return () => {
      clearTimeout(arm);
      document.removeEventListener('mouseout', onLeave);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay z-[70] bg-ink/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="m-auto w-full max-w-md rounded-3xl bg-cream p-6 text-center text-ink sm:p-8"
          >
            <h2 id="exit-title" className="font-display text-2xl leading-tight sm:text-3xl">
              {d.offer.exit.title}
            </h2>
            <p className="mt-4">{d.offer.exit.body}</p>
            <p className="my-5 rounded-xl border-2 border-dashed border-gold px-3 py-3 font-mono text-xl tracking-widest [overflow-wrap:anywhere] sm:text-2xl">{d.offer.exit.code}</p>
            <GlowButton
              className="w-full"
              autoFocus
              onClick={() => {
                setCoupon(d.offer.exit.code);
                setOpen(false);
                scrollToPricing();
              }}
            >
              {d.offer.exit.cta}
            </GlowButton>
            <button onClick={() => setOpen(false)} className="mt-3 min-h-[44px] px-3 text-sm text-ink/70 underline-offset-4 hover:underline">
              {d.offer.exit.dismiss}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
