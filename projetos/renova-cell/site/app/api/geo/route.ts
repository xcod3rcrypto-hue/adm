import type { NextRequest } from 'next/server';
import { localeFromCountry } from '@/lib/i18n';
import { json } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** IP-based country detection (Vercel edge headers). */
export function GET(req: NextRequest) {
  const country = req.headers.get('x-vercel-ip-country') ?? req.geo?.country ?? null;
  return json({ country, locale: localeFromCountry(country) });
}
