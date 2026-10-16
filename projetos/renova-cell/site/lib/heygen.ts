import 'server-only';
import type { Locale } from './i18n';
import type { Persona } from './quiz';
import { db } from './supabase';

export { generateVSL, getVideoStatus } from './heygen-api';

/**
 * HeyGen VSL generation (API v2).
 * Videos are generated once per persona × locale and cached in Supabase (`vsl_cache`).
 * HeyGen's video_url is a signed link that expires, so the CLI script
 * (scripts/heygen-generate.ts) copies finished videos to Supabase Storage and stores that URL.
 */

/** Public read used by the landing page: a finished, permanently hosted video or nothing. */
export async function cachedVsl(persona: Persona, locale: Locale): Promise<string | null> {
  const supabase = db();
  if (!supabase) return process.env[`NEXT_PUBLIC_VSL_URL_${persona.toUpperCase()}`] ?? null;
  const pick = async (l: Locale) => {
    const { data } = await supabase
      .from('vsl_cache')
      .select('video_url, status')
      .eq('persona', persona)
      .eq('locale', l)
      .maybeSingle();
    return data?.status === 'completed' ? (data.video_url as string | null) : null;
  };
  // Fall back to the English video rather than showing nothing.
  return (await pick(locale)) ?? (locale !== 'en' ? await pick('en') : null);
}
