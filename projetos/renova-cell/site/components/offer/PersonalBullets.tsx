'use client';

import { motion } from 'framer-motion';
import { useT } from '@/lib/hooks';
import { useOffer } from './context';

export function PersonalBullets() {
  const { d } = useT();
  const { answers } = useOffer();
  const items = d.offer.bullets.items[answers.pain];
  return (
    <section className="section">
      <h2 className="h2 mb-8 text-center">{d.offer.bullets.title}</h2>
      <ul className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
        {items.map((item, i) => (
          <motion.li
            key={item}
            initial={{ y: 16 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card p-6"
          >
            <span aria-hidden className="mb-3 block text-2xl text-gold">
              ✦
            </span>
            {item}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
