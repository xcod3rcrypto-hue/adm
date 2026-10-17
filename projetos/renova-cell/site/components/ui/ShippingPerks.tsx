'use client';

import { useMarket, useT } from '@/lib/hooks';

/** Free shipping · up to 2 business days (or tracked delivery outside FAST_DELIVERY_COUNTRIES) · discreet packaging. */
export function ShippingPerks({ className = '' }: { className?: string }) {
  const { d } = useT();
  const { fastDelivery } = useMarket();
  const s = d.offer.shipping;
  const perks: [string, string][] = [
    ['🚚', s.free],
    ['⚡', fastDelivery ? s.fast : s.tracked],
    ['📦', s.discreet],
  ];
  return (
    <ul className={`flex flex-wrap justify-center gap-2 text-sm ${className}`}>
      {perks.map(([icon, label]) => (
        <li key={label} className="card flex items-center gap-2 px-3 py-2">
          <span aria-hidden>{icon}</span>
          {label}
        </li>
      ))}
    </ul>
  );
}
