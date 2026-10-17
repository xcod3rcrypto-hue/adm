'use client';

import { useT } from '@/lib/hooks';

/** Free shipping · fast tracked delivery · discreet packaging. */
export function ShippingPerks({ className = '' }: { className?: string }) {
  const { d } = useT();
  const s = d.offer.shipping;
  const perks: [string, string][] = [
    ['🚚', s.free],
    ['⚡', s.fast],
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
