import type { NextRequest } from 'next/server';
import { generateHeadline } from '@/lib/claude';
import { badRequest, clientIp, json, localeOr, rateLimited, readJson } from '@/lib/http';
import { parseAnswers } from '@/lib/quiz';

export const dynamic = 'force-dynamic';

/** Personalized headline for a persona without saving anything (used to regenerate on language change). */
export async function POST(req: NextRequest) {
  if (rateLimited(`headline:${clientIp(req)}`, 10, 60_000)) return json({ error: 'Too many requests' }, 429);
  const body = await readJson<{ answers?: unknown; locale?: unknown }>(req);
  const answers = parseAnswers(body?.answers);
  if (!answers) return badRequest('Invalid answers');
  return json({ headline: await generateHeadline(answers, localeOr(body?.locale)) });
}
