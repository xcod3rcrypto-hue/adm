import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms — RENOVA CELL' };

/** Key commercial terms enforced by the code. Replace with lawyer-reviewed terms before launch. */
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14 leading-relaxed">
      <h1 className="h2 mb-6">Terms</h1>
      <ul className="list-disc space-y-2 pl-5">
        <li>Prices are in US dollars and shown before payment.</li>
        <li>The Kit 6 plan and the member subscription renew monthly at the price shown until cancelled. Cancel anytime via the link in your receipt or by contacting support.</li>
        <li>Post-purchase offers charge the card you just used only after you click to accept; the amount is shown above the button.</li>
        <li>30-day money-back guarantee on your first order.</li>
        <li>RENOVA CELL is a dietary supplement, not a medicine. It is not intended to diagnose, treat, cure or prevent any disease. Individual results vary.</li>
      </ul>
    </main>
  );
}
