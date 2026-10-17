'use client';

import { useT } from '@/lib/hooks';
import { useFunnel } from '@/lib/store';

/** One-time purchase or subscription (the same plan again whenever the supply runs out). */
export function PurchaseToggle({ className = '' }: { className?: string }) {
  const { d } = useT();
  const subscribe = useFunnel((s) => s.subscribe);
  const setSubscribe = useFunnel((s) => s.setSubscribe);
  const p = d.offer.pricing;
  const option = (value: boolean, label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={subscribe === value}
      onClick={() => setSubscribe(value)}
      className={`min-h-[44px] flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        subscribe === value ? 'bg-emerald-brand text-cream shadow' : 'muted'
      }`}
    >
      {label}
    </button>
  );
  return (
    <div role="radiogroup" aria-label={p.title} className={`flex w-full max-w-xl gap-1 rounded-full border border-[var(--line)] p-1 ${className}`}>
      {option(false, p.once)}
      {option(true, p.subscribe)}
    </div>
  );
}
