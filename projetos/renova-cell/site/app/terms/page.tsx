import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { isFastDelivery } from '@/lib/market';

export const metadata: Metadata = { title: 'Terms — VitalRise' };

/** Key commercial terms enforced by the code. Replace with lawyer-reviewed terms before launch. */
export default function TermsPage() {
  const fast = isFastDelivery(headers().get('x-vercel-ip-country'));
  return (
    <main className="mx-auto max-w-2xl px-gutter py-safe leading-relaxed [--py:3.5rem]">
      <h1 className="h2 mb-6">Terms</h1>
      <ul className="list-disc space-y-2 pl-5">
        <li>Prices are shown and charged in your local currency (set by your country) before payment.</li>
        <li>
          Every plan can be bought once or as a subscription at the same price. A subscription renews when the supply runs out:
          1 unit every month, Kit 3 every 3 months, Kit 6 every 6 months, until cancelled. Cancel anytime via the link in your
          receipt or by contacting support.
        </li>
        <li>Shipping is free to every country we deliver to. We do not ship to Ukraine or Russia. {fast ? 'Delivery takes up to 2 business days' : 'The delivery estimate for your country is shown at checkout'}, with tracking, in plain, discreet packaging.</li>
        <li>Post-purchase offers charge the card you just used only after you click to accept; the amount is shown above the button.</li>
        <li>30-day money-back guarantee on your first order.</li>
        <li>VitalRise is a food supplement, not a medicine. It is not intended to diagnose, treat, cure or prevent any disease. Individual results vary.</li>
      </ul>
    </main>
  );
}
