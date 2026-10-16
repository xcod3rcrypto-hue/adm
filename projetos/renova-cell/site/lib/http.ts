import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, type Locale } from './i18n';

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const badRequest = (message: string) => json({ error: message }, 400);

export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
}

export function localeOr(value: unknown, fallback: Locale = 'en'): Locale {
  return isLocale(value) ? value : fallback;
}

export async function readJson<T = Record<string, unknown>>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Best-effort fixed-window limiter. Serverless instances do not share memory, so this
 * only slows down a single abusive client; put a real limiter (Upstash, Vercel WAF)
 * in front of /api/chat and /api/quiz before spending real money on ads.
 */
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    if (hits.size > 10_000) hits.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** E.164, e.g. +15551234567 */
export const PHONE_RE = /^\+[1-9]\d{7,14}$/;
