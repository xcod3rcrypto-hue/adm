'use client';

import { useT } from '@/lib/hooks';
import { LanguageSwitcher } from './LanguageSwitcher';

/** `floating`: the page has a chat button / sticky bar, so the last line must be able to scroll clear of them. */
export function Footer({ floating = false }: { floating?: boolean }) {
  const { d, currency } = useT();
  const year = new Date().getFullYear();
  const contact = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return (
    <footer className={`border-t border-[var(--line)] px-gutter pt-10 text-sm [--pb:2.5rem] ${floating ? 'pb-floating' : 'pb-safe'}`}>
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <p className="muted text-xs leading-relaxed">{currency === 'usd' ? d.common.fdaDisclaimer : d.common.euDisclaimer}</p>
        <p className="muted text-xs">{d.common.resultsVary}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <a href="/privacy" className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center underline-offset-4 hover:underline">
            {d.offer.footer.privacy}
          </a>
          <a href="/terms" className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center underline-offset-4 hover:underline">
            {d.offer.footer.terms}
          </a>
          {contact && (
            <a href={`mailto:${contact}`} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center underline-offset-4 hover:underline">
              {d.offer.footer.contact}
            </a>
          )}
          <LanguageSwitcher className="sm:ml-auto" />
        </div>
        <p className="muted text-xs">
          © {year} {d.common.brand}. {d.offer.footer.rights}
        </p>
      </div>
    </footer>
  );
}
