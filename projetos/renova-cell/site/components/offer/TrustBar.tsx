'use client';

import { useT } from '@/lib/hooks';
import { useOffer } from './context';

export function TrustBar() {
  const { d, f } = useT();
  const { name } = useOffer();
  return (
    <div className="bg-emerald-brand px-gutter pb-2 pt-safe text-center text-sm text-cream [--pt:0.5rem]">
      <span aria-hidden>✅ </span>
      {name ? f(d.offer.trust, { name }) : d.offer.trustAnon}
    </div>
  );
}
