import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import type { ReactNode } from 'react';
import { Analytics } from '@/components/Analytics';
import { Providers } from '@/components/Providers';
import { DEFAULT_LOCALE, htmlLang, isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isCurrency } from '@/lib/products';
import './globals.css';

// Subsets for every European language we serve (Polish/Czech/Baltic…, Cyrillic, Greek).
// Playfair Display has no Greek: Greek headings fall back to Georgia/serif.
const display = Playfair_Display({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-display', display: 'swap' });
const body = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic', 'greek'], variable: '--font-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext', 'cyrillic', 'greek'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'RENOVA CELL — Your personalized collagen plan',
  description: 'Take the 60-second quiz and get a daily collagen + peptide plan matched to you.',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Draw edge to edge on notched phones; every fixed element and full-screen layout pads itself with env(safe-area-inset-*).
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7F2' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0D0D' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Middleware forwards the resolved locale; the cookie covers later requests.
  const fromHeader = headers().get('x-rc-locale');
  const fromCookie = cookies().get('rc_locale')?.value;
  const locale = isLocale(fromHeader) ? fromHeader : isLocale(fromCookie) ? fromCookie : DEFAULT_LOCALE;
  // Currency from the visitor's country (middleware), so server and client show the same prices.
  const currencyHeader = headers().get('x-rc-currency');
  const currencyCookie = cookies().get('rc_currency')?.value;
  const currency = isCurrency(currencyHeader) ? currencyHeader : isCurrency(currencyCookie) ? currencyCookie : 'usd';

  return (
    <html lang={htmlLang(locale)} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-sans">
        <Providers initialLocale={locale} initialDictionary={getDictionary(locale)} currency={currency}>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
