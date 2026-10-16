'use client';

import { writeCookie } from '@/lib/browser';
import { LOCALES, LOCALE_NAMES, type Locale } from '@/lib/i18n';
import { useT } from '@/lib/hooks';
import { useFunnel } from '@/lib/store';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, d } = useT();
  const setLocale = useFunnel((s) => s.setLocale);
  return (
    <label className={`inline-flex items-center gap-2 text-sm ${className}`}>
      <span className="sr-only">{d.common.language}</span>
      <span aria-hidden>🌐</span>
      <select
        value={locale}
        onChange={(e) => {
          const next = e.target.value as Locale;
          setLocale(next, true);
          writeCookie('rc_locale', next);
          document.documentElement.lang = next;
        }}
        className="rounded-md border border-current/20 bg-transparent px-2 py-1"
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
