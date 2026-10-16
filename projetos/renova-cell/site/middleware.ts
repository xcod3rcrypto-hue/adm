import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, localeFromCountry } from './lib/i18n';

/**
 * 1. IP → locale: Vercel sets `x-vercel-ip-country`. We store the derived locale in
 *    `rc_locale` so the first server render already uses the right language.
 *    A locale the visitor picked (also `rc_locale`, set by the switcher) is never overwritten.
 * 2. A/B bucket: sticky `rc_ab` cookie. Share of traffic in B is set by AB_SPLIT_B (0–1, default 0.5).
 */
export function middleware(request: NextRequest) {
  const year = 60 * 60 * 24 * 365;
  const country = request.headers.get('x-vercel-ip-country') ?? request.geo?.country ?? null;
  const saved = request.cookies.get('rc_locale')?.value;
  const locale = isLocale(saved) ? saved : localeFromCountry(country);

  // Forward the resolved locale to the server render of this same request.
  const headers = new Headers(request.headers);
  headers.set('x-rc-locale', locale);
  const response = NextResponse.next({ request: { headers } });

  if (!isLocale(saved)) {
    response.cookies.set('rc_locale', locale, { path: '/', maxAge: year, sameSite: 'lax' });
  }

  if (!request.cookies.get('rc_ab')) {
    const split = Number(process.env.AB_SPLIT_B ?? '0.5');
    const variant = Math.random() < (Number.isFinite(split) ? split : 0.5) ? 'B' : 'A';
    response.cookies.set('rc_ab', variant, { path: '/', maxAge: year, sameSite: 'lax' });
  }

  return response;
}

export const config = {
  // Pages only — skip API routes, Next internals and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images/).*)'],
};
