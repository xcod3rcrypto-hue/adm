'use client';

import { motion } from 'framer-motion';
import { useT } from '@/lib/hooks';
import { ageMidpoint, estimatedCollagenLossPct } from '@/lib/quiz';
import { useOffer } from './context';

export function DiagnosisCard() {
  const { d, f } = useT();
  const { answers } = useOffer();
  const pct = estimatedCollagenLossPct(ageMidpoint(answers.age));
  return (
    <section className="section">
      <motion.div initial={{ y: 20 }} whileInView={{ y: 0 }} viewport={{ once: true }} className="card mx-auto max-w-2xl p-6 text-center sm:p-8">
        <h2 className="h2">{d.offer.diagnosis.title}</h2>
        <p className="my-6 font-mono text-6xl text-coral-deep dark:text-coral sm:text-7xl">≈{pct}%</p>
        <div className="mx-auto mb-6 h-3 max-w-sm overflow-hidden rounded-full bg-[var(--line)]">
          {/* Static: the bar shows its real length even before (or without) any scroll animation. */}
          <div className="h-full rounded-full bg-coral" style={{ width: `${Math.min(100, pct * 2)}%` }} />
        </div>
        <p className="text-lg">{f(d.offer.diagnosis.body, { pct })}</p>
        <p className="muted mt-4 text-xs">{d.offer.diagnosis.note}</p>
      </motion.div>
    </section>
  );
}
