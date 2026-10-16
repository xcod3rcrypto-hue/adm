import type { NextRequest } from 'next/server';
import { json } from '@/lib/http';
import { localeFromAcceptLanguage, localeFromCountry } from '@/lib/i18n';
import { currencyForCountry } from '@/lib/products';

export const dynamic = 'force-dynamic';

/** Country (Vercel edge header), the locale we would pick, and the currency for that country. */
export function GET(req: NextRequest) {
  const country = req.headers.get('x-vercel-ip-country') ?? req.geo?.country ?? null;
  const locale = localeFromAcceptLanguage(req.headers.get('accept-language')) ?? localeFromCountry(country);
  return json({ country, locale, currency: currencyForCountry(country) });
}
