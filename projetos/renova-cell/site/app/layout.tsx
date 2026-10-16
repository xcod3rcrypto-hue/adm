import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import type { ReactNode } from 'react';
import { Analytics } from '@/components/Analytics';
import { Providers } from '@/components/Providers';
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n';
import './globals.css';

const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'RENOVA CELL — Your personalized collagen plan',
  description: 'Take the 60-second quiz and get a daily collagen + peptide plan matched to you.',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
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

  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-sans">
        <Providers initialLocale={locale}>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
