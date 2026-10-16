'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useHydrated, useT } from '@/lib/hooks';
import { parseAnswers } from '@/lib/quiz';
import { useFunnel } from '@/lib/store';

const MIN_MS = 3500;
const MAX_MS = 9000;

/**
 * The wait is real: this is where the answers are saved and the headline is written.
 * We show it for at least 3.5s so the steps can be read, and never more than 9s.
 */
export default function AnalyzingPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { d, locale } = useT();
  const [done, setDone] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    const { answers, contact, setResult } = useFunnel.getState();
    const parsed = parseAnswers(answers);
    if (!parsed) {
      router.replace('/quiz');
      return;
    }

    // Not cleared on unmount: the effect runs once (ref guard) and the timers are harmless.
    [800, 1900, 3000].forEach((ms, i) => setTimeout(() => setDone(i + 1), ms));
    const variant = /(?:^|; )rc_ab=B/.test(document.cookie) ? 'B' : 'A';
    const controller = new AbortController();
    const request = fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: parsed, locale, variant, contact }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null) as Promise<{ id: string | null; headline: string | null } | null>;
    const timeout = setTimeout(() => controller.abort(), MAX_MS);

    void Promise.all([request, new Promise((r) => setTimeout(r, MIN_MS))]).then(([result]) => {
      clearTimeout(timeout);
      setResult(result?.id ?? null, result?.headline ?? null);
      router.replace('/offer');
    });
  }, [hydrated, locale, router]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-quiz-gradient px-4 text-cream">
      <div className="w-full max-w-md text-center">
        <motion.div
          aria-hidden
          className="mx-auto mb-8 h-16 w-16 rounded-full border-4 border-gold/20 border-t-gold"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
        <h1 className="mb-8 font-display text-3xl">{d.analyzing.title}</h1>
        <ul className="space-y-4 text-left" aria-live="polite">
          {d.analyzing.steps.map((label, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: i <= done ? 1 : 0.3, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 text-lg"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${i < done ? 'bg-gold text-ink' : 'border border-cream/30'}`}>
                {i < done ? '✓' : ''}
              </span>
              {label}
            </motion.li>
          ))}
        </ul>
      </div>
    </main>
  );
}
