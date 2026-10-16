import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy — RENOVA CELL' };

/**
 * Plain-language summary of what this codebase actually collects.
 * Replace with your lawyer-reviewed policy (company name, address, DPO, retention) before launch.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14 leading-relaxed">
      <h1 className="h2 mb-6">Privacy</h1>
      <p className="mb-4">This summary describes what the RENOVA CELL site collects and why.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Quiz answers, language and country (from your IP) to personalize your plan.</li>
        <li>Name, email and phone only if you give them. Marketing emails and SMS only if you tick the matching box; unsubscribe anytime.</li>
        <li>Payments are processed by Stripe; we never see or store your full card number.</li>
        <li>Chat messages are sent to Anthropic (Claude) to generate replies and are not stored by us.</li>
        <li>Analytics and ad-measurement cookies (Google Analytics, Meta Pixel, PostHog, Hotjar) load only after you accept them.</li>
        <li>Service providers: Supabase (database), Stripe (payments), Resend (email), Twilio (SMS), Anthropic (AI), HeyGen (video), Vercel (hosting).</li>
      </ul>
      <p className="mt-6">To access or delete your data, contact {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'our support team'}.</p>
    </main>
  );
}
