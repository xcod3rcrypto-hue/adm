'use client';

import { motion } from 'framer-motion';
import { useT } from '@/lib/hooks';

const ICONS = ['✨', '❤️', '⚡'];

/** The three goals of the daily ritual: skin, desire & vitality (vitality & confidence when ad-safe), energy. */
export function Pillars() {
  const { d } = useT();
  const p = d.offer.pillars;
  return (
    <section className="section">
      <h2 className="h2 mb-8 text-center">{p.title}</h2>
      <ul className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
        {p.items.map((item, i) => (
          <motion.li
            key={item.title}
            initial={{ y: 16 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card p-6"
          >
            <span aria-hidden className="mb-3 block text-3xl">
              {ICONS[i]}
            </span>
            <h3 className="mb-2 font-display text-xl">{item.title}</h3>
            <p className="muted text-sm leading-relaxed">{item.body}</p>
          </motion.li>
        ))}
      </ul>
      <p className="muted mx-auto mt-6 max-w-3xl text-center text-xs">{p.note}</p>
    </section>
  );
}
