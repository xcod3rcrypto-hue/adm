'use client';

import { motion } from 'framer-motion';
import { useT } from '@/lib/hooks';

export function ComparisonTable() {
  const { d } = useT();
  const c = d.offer.comparison;
  const cell = (v: string) => (v === 'yes' ? '✓' : v === 'no' ? '—' : c.varies);
  // Fixed layout sized for a 320px screen: the label column gets half the width (whole words
  // like "Kollagenpeptide" fit at text-sm), the value columns hold a mark or one short word.
  // Anything longer ("Unterschiedlich") hyphenates where the browser can, or breaks, never overflows.
  const value = 'w-1/4 px-1 py-3 text-center [overflow-wrap:anywhere] hyphens-auto sm:p-4';
  return (
    <section className="section">
      <h2 className="h2 mb-8 text-center">{c.title}</h2>
      <motion.div initial={{ y: 16 }} whileInView={{ y: 0 }} viewport={{ once: true }} className="card mx-auto max-w-3xl overflow-hidden">
        <table className="w-full table-fixed text-left">
          <thead>
            <tr className="border-b border-[var(--line)] text-xs sm:text-sm">
              <th className="px-3 py-3 sm:p-4" scope="col">
                <span className="sr-only">—</span>
              </th>
              <th className={`${value} bg-emerald-brand text-cream`} scope="col">
                {c.us}
              </th>
              <th className={value} scope="col">
                {c.them}
              </th>
            </tr>
          </thead>
          <tbody>
            {c.rows.map((row) => (
              <tr key={row.label} className="border-b border-[var(--line)] last:border-0">
                <th scope="row" className="px-3 py-3 text-sm font-normal hyphens-auto [overflow-wrap:anywhere] sm:p-4 sm:text-base">
                  {row.label}
                </th>
                <td className={`${value} bg-emerald-brand/10 text-xl text-emerald-brand dark:text-gold`}>{cell(row.us)}</td>
                <td className={`${value} muted ${row.them === 'yes' || row.them === 'no' ? 'text-xl' : 'text-xs sm:text-base'}`}>{cell(row.them)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </section>
  );
}
