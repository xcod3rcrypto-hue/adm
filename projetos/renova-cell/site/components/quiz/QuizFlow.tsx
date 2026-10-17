'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { useHydrated, usePrefersReducedMotion, useT } from '@/lib/hooks';
import { AGES, DURATIONS, GENDERS, GOALS, HISTORIES, PAINS, type QuizAnswers } from '@/lib/quiz';
import { useFunnel } from '@/lib/store';
import { ContactStep } from './ContactStep';
import { SliderQuestion } from './SliderQuestion';

const ICONS: Record<string, string> = {
  male: '👨', female: '👩', other: '🙂',
  '25-34': '🌱', '35-44': '🌿', '45-54': '🌳', '55+': '🌟',
  skin: '✨', energy: '⚡', libido: '❤️', joints: '🦴', all: '💯',
  lt6m: '🕐', '6m-2y': '📅', '2y+': '⏳',
  never: '🆕', tried: '🤔', using: '💊',
};

type ChoiceKey = 'gender' | 'age' | 'pain' | 'duration' | 'history' | 'goal';
type Step =
  | { kind: 'choice'; key: ChoiceKey; options: readonly string[] }
  | { kind: 'slider'; key: 'energy' | 'confidence' };

const STEPS: Step[] = [
  { kind: 'choice', key: 'gender', options: GENDERS },
  { kind: 'choice', key: 'age', options: AGES },
  { kind: 'choice', key: 'pain', options: PAINS },
  { kind: 'choice', key: 'duration', options: DURATIONS },
  { kind: 'choice', key: 'history', options: HISTORIES },
  { kind: 'slider', key: 'energy' },
  { kind: 'slider', key: 'confidence' },
  { kind: 'choice', key: 'goal', options: GOALS },
];
const TOTAL = STEPS.length + 1; // + contact step

export function QuizFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const { d, f } = useT();
  const { step, setStep, answers, answer } = useFunnel();
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (hydrated && step === 0) track('quiz_start');
  }, [hydrated, step]);

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(Math.max(0, Math.min(TOTAL - 1, next)));
  };

  const finish = () => {
    track('quiz_complete', { persona_gender: answers.gender ?? '', age: answers.age ?? '' });
    router.push('/analyzing');
  };

  if (!hydrated) return <div className="screen bg-quiz-gradient" />;

  const pct = Math.round((step / TOTAL) * 100);
  const current = STEPS[step];
  const offset = reduced ? 0 : 60;

  return (
    <main className="screen flex flex-col bg-quiz-gradient text-cream">
      <header className="mx-auto w-full max-w-xl px-gutter pt-4">
        <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
          <button
            onClick={() => go(step - 1)}
            disabled={step === 0}
            className="min-h-[44px] justify-self-start whitespace-nowrap rounded-full px-2 text-cream/80 hover:text-cream disabled:opacity-30"
          >
            ← {d.common.back}
          </button>
          <span className="whitespace-nowrap font-display tracking-[0.2em] text-gold-soft">{d.common.brand}</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-cream/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-valuetext={f(d.quiz.progress, { pct })}
          >
            <motion.div className="h-full rounded-full bg-gold" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="shrink-0 font-mono text-xs text-cream/80 sm:text-sm">{f(d.quiz.progress, { pct })}</span>
        </div>
        {step === 0 && <p className="mt-4 text-center text-sm text-cream/80">{d.quiz.intro}</p>}
      </header>

      {/* overflow-x-clip: the sliding step stays inside this row instead of scrolling the page sideways. */}
      <section className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center overflow-x-clip px-gutter py-6 sm:py-8">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * offset }}
            transition={{ duration: 0.25 }}
          >
            {current?.kind === 'choice' && (
              <fieldset className="min-w-0">
                <legend className="mb-6 w-full text-center font-display text-3xl leading-tight sm:text-4xl">
                  {d.quiz.questions[current.key].title}
                </legend>
                <div className="grid gap-3">
                  {current.options.map((option) => {
                    const label = (d.quiz.questions[current.key].options as Record<string, string>)[option];
                    const selected = answers[current.key] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          answer(current.key, option as QuizAnswers[typeof current.key]);
                          go(step + 1);
                        }}
                        aria-pressed={selected}
                        className={`flex min-h-[64px] w-full items-center gap-4 rounded-2xl border px-5 py-2 text-left text-lg transition ${
                          selected ? 'border-gold bg-gold/15' : 'border-cream/15 bg-cream/5 hover:border-gold/60 hover:bg-cream/10'
                        }`}
                      >
                        <span className="text-2xl" aria-hidden>
                          {ICONS[option]}
                        </span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
            {current?.kind === 'slider' && (
              <SliderQuestion
                title={d.quiz.questions[current.key].title}
                min={d.quiz.questions[current.key].min}
                max={d.quiz.questions[current.key].max}
                value={answers[current.key] ?? 5}
                onChange={(v) => answer(current.key, v)}
                onNext={() => {
                  if (answers[current.key] === undefined) answer(current.key, 5);
                  go(step + 1);
                }}
                nextLabel={d.common.next}
              />
            )}
            {step === STEPS.length && <ContactStep onDone={finish} />}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}
