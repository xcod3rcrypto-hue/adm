import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, localeFromAcceptLanguage, localeFromCountry } from './lib/i18n';
import { currencyForCountry } from './lib/products';

/**
 * 1. Language: a language the visitor picked in the footer (rc_locale + rc_locale_chosen) wins.
 *    Otherwise the phone/browser language (Accept-Language), and only if that is not one we
 *    support, the IP country (Vercel's x-vercel-ip-country). Resolved on every request, so a
 *    visitor who changes their phone language gets the new one next time.
 * 2. Currency: from the IP country (where they pay from) → rc_currency cookie.
 * 3. A/B bucket: sticky rc_ab cookie; share in B set by AB_SPLIT_B (0–1, default 0.5).
 * The resolved values are forwarded as request headers so the first server render uses them.
 */
export function middleware(request: NextRequest) {
  const year = 60 * 60 * 24 * 365;
  const country = request.headers.get('x-vercel-ip-country') ?? request.geo?.country ?? null;
  const saved = request.cookies.get('rc_locale')?.value;
  const chosen = request.cookies.get('rc_locale_chosen')?.value === '1' && isLocale(saved);

  const locale = chosen
    ? saved
    : (localeFromAcceptLanguage(request.headers.get('accept-language')) ?? localeFromCountry(country));
  const currency = currencyForCountry(country);

  const headers = new Headers(request.headers);
  headers.set('x-rc-locale', locale);
  headers.set('x-rc-currency', currency);
  const response = NextResponse.next({ request: { headers } });

  const cookie = { path: '/', maxAge: year, sameSite: 'lax' as const };
  if (saved !== locale) response.cookies.set('rc_locale', locale, cookie);
  if (request.cookies.get('rc_currency')?.value !== currency) response.cookies.set('rc_currency', currency, cookie);

  if (!request.cookies.get('rc_ab')) {
    const split = Number(process.env.AB_SPLIT_B ?? '0.5');
    const variant = Math.random() < (Number.isFinite(split) ? split : 0.5) ? 'B' : 'A';
    response.cookies.set('rc_ab', variant, cookie);
  }

  return response;
}

export const config = {
  // Pages only — skip API routes, Next internals and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg|images/).*)'],
};
