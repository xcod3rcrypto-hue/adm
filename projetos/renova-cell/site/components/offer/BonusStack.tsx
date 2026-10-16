'use client';

import { motion } from 'framer-motion';
import { useT } from '@/lib/hooks';

const ICONS = ['📘', '🥗', '👑'];

export function BonusStack() {
  const { d } = useT();
  return (
    <section className="section">
      <h2 className="h2 mb-8 text-center">{d.offer.bonus.title}</h2>
      <div className="mx-auto flex max-w-md flex-col">
        {d.offer.bonus.items.map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: -30, rotate: -2 }}
            whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 160 }}
            className="card -mt-2 flex items-center gap-4 p-5 shadow-lg first:mt-0"
          >
            <span className="text-3xl" aria-hidden>
              {ICONS[i]}
            </span>
            <span className="font-semibold">{item}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
