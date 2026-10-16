'use client';

import { useT } from '@/lib/hooks';
import { useOffer } from './context';

export function TrustBar() {
  const { d, f } = useT();
  const { name } = useOffer();
  return (
    <div className="bg-emerald-brand px-4 py-2 text-center text-sm text-cream">
      <span aria-hidden>✅ </span>
      {name ? f(d.offer.trust, { name }) : d.offer.trustAnon}
    </div>
  );
}
