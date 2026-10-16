'use client';

import { GlowButton } from '../ui/GlowButton';

interface Props {
  title: string;
  min: string;
  max: string;
  value: number;
  onChange: (value: number) => void;
  onNext: () => void;
  nextLabel: string;
}

export function SliderQuestion({ title, min, max, value, onChange, onNext, nextLabel }: Props) {
  return (
    <div className="text-center">
      <h2 id="slider-title" className="mb-10 font-display text-3xl leading-tight sm:text-4xl">
        {title}
      </h2>
      <output className="mb-6 block font-mono text-6xl text-gold" htmlFor="quiz-slider">
        {value}
      </output>
      <input
        id="quiz-slider"
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        aria-labelledby="slider-title"
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-3 w-full cursor-pointer accent-[#D4AF37]"
      />
      <div className="mt-3 flex justify-between text-sm text-cream/70">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <GlowButton className="mt-10 w-full" onClick={onNext}>
        {nextLabel} →
      </GlowButton>
    </div>
  );
}
