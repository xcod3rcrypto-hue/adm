'use client';

import { motion } from 'framer-motion';
import { useT } from '@/lib/hooks';

export function GuaranteeSeal() {
  const { d } = useT();
  return (
    <section className="section">
      <div className="card mx-auto flex max-w-3xl flex-col items-center gap-6 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <motion.div
          aria-hidden
          className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-dashed border-gold bg-ink text-gold"
          initial={{ rotate: -20, scale: 0.85 }}
          whileInView={{ rotate: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 120 }}
        >
          <span className="font-display text-4xl">30</span>
        </motion.div>
        <div className="min-w-0">
          <h2 className="h2">{d.offer.guarantee.title}</h2>
          <p className="muted mt-3">{d.offer.guarantee.body}</p>
        </div>
      </div>
    </section>
  );
}
