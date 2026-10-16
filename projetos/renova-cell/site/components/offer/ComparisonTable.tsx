'use client';

import { motion } from 'framer-motion';
import { useT } from '@/lib/hooks';

export function ComparisonTable() {
  const { d } = useT();
  const c = d.offer.comparison;
  const cell = (v: string) => (v === 'yes' ? '✓' : v === 'no' ? '—' : c.varies);
  return (
    <section className="section">
      <h2 className="h2 mb-8 text-center">{c.title}</h2>
      <div className="card mx-auto max-w-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--line)] text-sm">
              <th className="p-4" scope="col">
                <span className="sr-only">—</span>
              </th>
              <th className="bg-emerald-brand p-4 text-center text-cream" scope="col">
                {c.us}
              </th>
              <th className="p-4 text-center" scope="col">
                {c.them}
              </th>
            </tr>
          </thead>
          <tbody>
            {c.rows.map((row, i) => (
              <motion.tr
                key={row.label}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border-b border-[var(--line)] last:border-0"
              >
                <th scope="row" className="p-4 font-normal">
                  {row.label}
                </th>
                <td className="bg-emerald-brand/10 p-4 text-center text-xl text-emerald-brand dark:text-gold">{cell(row.us)}</td>
                <td className="muted p-4 text-center">{cell(row.them)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
