'use client';

import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useT } from '@/lib/hooks';
import { ageMidpoint, estimatedCollagenLossPct } from '@/lib/quiz';
import { useOffer } from './context';

/**
 * Illustrates the commonly cited ~1%/year collagen decline after 25 and where the visitor sits.
 * Deliberately does NOT draw a "with RENOVA CELL" line — we have no data to support one.
 */
export function ResultSimulator() {
  const { d } = useT();
  const { answers } = useOffer();
  const [age, setAge] = useState(ageMidpoint(answers.age));
  const data = useMemo(
    () => Array.from({ length: 11 }, (_, i) => 20 + i * 5).map((a) => ({ age: a, collagen: 100 - estimatedCollagenLossPct(a) })),
    [],
  );
  const you = 100 - estimatedCollagenLossPct(age);

  return (
    <section className="section">
      <h2 className="h2 mb-6 text-center">{d.offer.simulator.title}</h2>
      <div className="card mx-auto max-w-3xl p-4 sm:p-8">
        <label className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>{d.offer.simulator.label}</span>
          <span className="flex min-w-[12rem] flex-1 items-center gap-4">
            {/* h-11: a 44px touch target around the native track. */}
            <input
              type="range"
              min={20}
              max={70}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="h-11 min-w-0 flex-1 cursor-pointer accent-[#0E5C4A] dark:accent-[#D4AF37]"
            />
            <output className="w-12 shrink-0 text-right font-mono text-xl">{age}</output>
          </span>
        </label>
        <div className="h-64 w-full [--chart-line:#0E5C4A] dark:[--chart-line:#D4AF37]">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="age" stroke="var(--muted)" fontSize={12} />
              <YAxis domain={[40, 100]} stroke="var(--muted)" fontSize={12} unit="%" />
              <Tooltip
                formatter={(v) => [`${v}%`, d.offer.simulator.yAxis]}
                labelFormatter={(l) => `${d.offer.simulator.label}: ${l}`}
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, color: 'var(--page-fg)' }}
                itemStyle={{ color: 'var(--page-fg)' }}
                labelStyle={{ color: 'var(--muted)' }}
              />
              <Line type="monotone" dataKey="collagen" stroke="var(--chart-line)" strokeWidth={3} dot={false} isAnimationActive />
              <ReferenceDot
                x={Math.round(age / 5) * 5}
                y={you}
                r={8}
                fill="#FF6B5A"
                stroke="none"
                // Beside the dot, on the side away from the edge: above the line, never on it or clipped.
                label={{ value: d.offer.simulator.you, position: age > 60 ? 'left' : 'right', offset: 12, fill: 'var(--page-fg)', fontSize: 13 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="muted mt-4 text-center text-xs">
          {d.offer.simulator.yAxis}. {d.offer.simulator.note}
        </p>
      </div>
    </section>
  );
}
