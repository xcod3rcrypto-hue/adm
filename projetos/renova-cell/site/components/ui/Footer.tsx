'use client';

import { useT } from '@/lib/hooks';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Footer() {
  const { d } = useT();
  const year = new Date().getFullYear();
  const contact = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return (
    <footer className="border-t border-[var(--line)] px-4 py-10 text-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <p className="muted text-xs leading-relaxed">{d.common.fdaDisclaimer}</p>
        <p className="muted text-xs">{d.common.resultsVary}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href="/privacy" className="underline-offset-4 hover:underline">
            {d.offer.footer.privacy}
          </a>
          <a href="/terms" className="underline-offset-4 hover:underline">
            {d.offer.footer.terms}
          </a>
          {contact && (
            <a href={`mailto:${contact}`} className="underline-offset-4 hover:underline">
              {d.offer.footer.contact}
            </a>
          )}
          <LanguageSwitcher className="ml-auto" />
        </div>
        <p className="muted text-xs">
          © {year} {d.common.brand}. {d.offer.footer.rights}
        </p>
      </div>
    </footer>
  );
}
