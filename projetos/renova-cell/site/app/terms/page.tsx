import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms — RENOVA CELL' };

/** Key commercial terms enforced by the code. Replace with lawyer-reviewed terms before launch. */
export default function TermsPage() {
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
        <li>Shipping is free to every country we deliver to. We do not ship to Ukraine or Russia. Orders ship with tracking in plain, discreet packaging.</li>
        <li>Post-purchase offers charge the card you just used only after you click to accept; the amount is shown above the button.</li>
        <li>30-day money-back guarantee on your first order.</li>
        <li>RENOVA CELL is a food supplement, not a medicine. It is not intended to diagnose, treat, cure or prevent any disease. Individual results vary.</li>
      </ul>
    </main>
  );
}
