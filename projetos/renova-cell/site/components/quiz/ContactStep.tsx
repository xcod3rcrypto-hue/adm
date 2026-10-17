'use client';

import { useState } from 'react';
import { useT } from '@/lib/hooks';
import { useFunnel } from '@/lib/store';
import { GlowButton } from '../ui/GlowButton';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+[1-9]\d{7,14}$/;

/** Optional lead capture. Consent boxes are unticked by default and never required. */
export function ContactStep({ onDone }: { onDone: () => void }) {
  const { d } = useT();
  const { contact, setContact } = useFunnel();
  const [error, setError] = useState<string | null>(null);
  const c = d.quiz.contact;
  const phone = contact.phone.replace(/[\s()-]/g, '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contact.email && !EMAIL_RE.test(contact.email)) return setError(c.email);
    if (phone && !PHONE_RE.test(phone)) return setError(c.phone);
    setContact({ phone });
    onDone();
  };

  const input = 'min-h-[52px] w-full rounded-xl border border-cream/20 bg-cream/5 px-4 text-lg placeholder:text-cream/70 focus:border-gold';

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <h2 className="text-center font-display text-3xl leading-tight sm:text-4xl">{c.title}</h2>
      <p className="text-center text-sm text-cream/80">{c.subtitle}</p>
      <input className={input} placeholder={c.name} autoComplete="given-name" value={contact.name} onChange={(e) => setContact({ name: e.target.value })} aria-label={c.name} />
      <input className={input} type="email" placeholder={c.email} autoComplete="email" value={contact.email} onChange={(e) => setContact({ email: e.target.value })} aria-label={c.email} />
      <label className="flex min-h-[44px] cursor-pointer items-start gap-3 py-2 text-sm text-cream/85">
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#D4AF37]" checked={contact.marketingConsent} onChange={(e) => setContact({ marketingConsent: e.target.checked })} />
        {c.marketing}
      </label>
      <input className={input} type="tel" placeholder={`${c.phone} — +1…`} autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ phone: e.target.value })} aria-label={c.phone} />
      {contact.phone && (
        <label className="flex min-h-[44px] cursor-pointer items-start gap-3 py-2 text-sm text-cream/85">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#D4AF37]" checked={contact.smsConsent} onChange={(e) => setContact({ smsConsent: e.target.checked })} />
          {c.sms}
        </label>
      )}
      {error && (
        <p role="alert" className="text-sm text-coral-soft">
          ⚠ {error}
        </p>
      )}
      <GlowButton type="submit" className="w-full">
        {c.submit} →
      </GlowButton>
      <button
        type="button"
        onClick={() => {
          setContact({ email: '', phone: '', marketingConsent: false, smsConsent: false });
          onDone();
        }}
        className="block min-h-[44px] w-full text-sm text-cream/80 underline-offset-4 hover:underline"
      >
        {c.skip}
      </button>
      <p className="text-center text-xs text-cream/75">🔒 {c.privacy}</p>
    </form>
  );
}
