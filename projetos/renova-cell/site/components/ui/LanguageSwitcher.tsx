'use client';

import { writeCookie } from '@/lib/browser';
import { LOCALES, LOCALE_NAMES, type Locale } from '@/lib/i18n';
import { useT } from '@/lib/hooks';
import { useFunnel } from '@/lib/store';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, d } = useT();
  const setLocale = useFunnel((s) => s.setLocale);
  return (
    <label className={`inline-flex max-w-full items-center gap-2 text-sm ${className}`}>
      <span className="sr-only">{d.common.language}</span>
      <span aria-hidden>🌐</span>
      <select
        value={locale}
        onChange={(e) => {
          const next = e.target.value as Locale;
          setLocale(next, true);
          writeCookie('rc_locale', next);
          // Tells the middleware this was a choice, so it wins over the phone's language and the IP.
          writeCookie('rc_locale_chosen', '1');
          document.documentElement.lang = next;
        }}
        className="min-h-[44px] max-w-full rounded-md border border-[color:var(--muted)] bg-transparent px-2 text-base"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} className="text-ink">
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
