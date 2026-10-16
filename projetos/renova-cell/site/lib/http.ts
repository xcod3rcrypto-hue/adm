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
 * Fixed-window rate limiter.
 * With UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN set, counters live in Upstash Redis
 * and are shared by every serverless instance. Without them, it falls back to per-instance
 * memory, which only slows down one abusive client (fine for local dev).
 * Fails open: if Redis is unreachable, the request is allowed and the error is logged.
 */
const hits = new Map<string, { count: number; reset: number }>();

function memoryLimited(key: string, limit: number, windowMs: number): boolean {
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

export async function rateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return memoryLimited(key, limit, windowMs);
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', `rl:${key}`],
        ['PEXPIRE', `rl:${key}`, String(windowMs), 'NX'],
      ]),
      cache: 'no-store',
    });
    const data = (await res.json()) as { result?: number; error?: string }[];
    const count = data[0]?.result;
    if (!res.ok || typeof count !== 'number') throw new Error(data[0]?.error ?? `HTTP ${res.status}`);
    return count > limit;
  } catch (error) {
    console.error('rate limiter unavailable, allowing request', error);
    return false;
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** E.164, e.g. +15551234567 */
export const PHONE_RE = /^\+[1-9]\d{7,14}$/;
