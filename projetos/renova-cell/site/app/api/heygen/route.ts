import type { NextRequest } from 'next/server';
import { cachedVsl } from '@/lib/heygen';
import { badRequest, json, localeOr } from '@/lib/http';
import type { Persona } from '@/lib/quiz';

const PERSONAS: Persona[] = ['woman', 'man', 'senior'];

/**
 * Public, read-only: returns the hosted VSL for a persona/locale, if one was generated.
 * Generation is deliberately NOT exposed over HTTP (it costs money per call) —
 * run `npm run vsl:generate` instead.
 */
export async function GET(req: NextRequest) {
  const persona = req.nextUrl.searchParams.get('persona') as Persona;
  if (!PERSONAS.includes(persona)) return badRequest('Invalid persona');
  const url = await cachedVsl(persona, localeOr(req.nextUrl.searchParams.get('locale')));
  return json({ url }, 200);
}
