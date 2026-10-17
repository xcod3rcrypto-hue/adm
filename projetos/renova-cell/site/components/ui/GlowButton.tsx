'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';

type Variant = 'gold' | 'dark' | 'ghost';

const styles: Record<Variant, string> = {
  // Ink on gold ≈ 10:1 contrast.
  gold: 'bg-gold text-ink shadow-[0_8px_30px_rgba(212,175,55,0.35)] hover:bg-gold-soft',
  dark: 'bg-ink text-cream hover:bg-emerald-deep dark:bg-cream dark:text-ink',
  ghost: 'border border-current bg-transparent',
};

function track(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
}

// max-w-full + text-center: long labels (German, French…) wrap inside the pill instead of widening the page.
const base =
  'glow inline-flex min-h-[52px] max-w-full items-center justify-center gap-2 rounded-full px-7 py-3 text-center text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export function GlowButton({ variant = 'gold', className = '', ...props }: ComponentProps<'button'> & { variant?: Variant }) {
  return <button {...props} onMouseMove={track} className={`${base} ${styles[variant]} ${className}`} />;
}

export function GlowLink({
  variant = 'gold',
  className = '',
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} onMouseMove={track} className={`${base} ${styles[variant]} ${className}`} />;
}
