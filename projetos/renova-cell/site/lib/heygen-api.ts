/**
 * HeyGen API v2 calls. No `server-only` marker so the CLI script can import it too —
 * it reads secrets from env and is never imported by client components.
 */
import type { Locale } from './i18n';
import type { Persona } from './quiz';

const API = 'https://api.heygen.com';

function apiKey(): string {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) throw new Error('HEYGEN_API_KEY is not set');
  return key;
}

function avatarFor(persona: Persona): string {
  const id =
    persona === 'man'
      ? process.env.HEYGEN_AVATAR_ID_MALE
      : persona === 'senior'
        ? process.env.HEYGEN_AVATAR_ID_SENIOR || process.env.HEYGEN_AVATAR_ID_FEMALE
        : process.env.HEYGEN_AVATAR_ID_FEMALE;
  if (!id) throw new Error(`No HeyGen avatar configured for persona "${persona}"`);
  return id;
}

/** HEYGEN_VOICE_ID_WOMAN_PT, falling back to HEYGEN_VOICE_ID_WOMAN (a multilingual voice). */
function voiceFor(persona: Persona, locale: Locale): string {
  const p = persona.toUpperCase();
  const id = process.env[`HEYGEN_VOICE_ID_${p}_${locale.toUpperCase()}`] || process.env[`HEYGEN_VOICE_ID_${p}`];
  if (!id) throw new Error(`No HeyGen voice configured for ${persona}/${locale}`);
  return id;
}

/** Starts a render and returns HeyGen's video_id. */
export async function generateVSL(persona: Persona, script: string, locale: Locale): Promise<string> {
  const res = await fetch(`${API}/v2/video/generate`, {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `VitalRise VSL — ${persona} — ${locale}`,
      video_inputs: [
        {
          character: { type: 'avatar', avatar_id: avatarFor(persona), avatar_style: 'normal' },
          voice: { type: 'text', input_text: script, voice_id: voiceFor(persona, locale) },
          background: { type: 'color', value: '#0D0D0D' },
        },
      ],
      dimension: { width: 1280, height: 720 },
    }),
  });
  const body = (await res.json()) as { data?: { video_id?: string }; error?: unknown };
  if (!res.ok || !body.data?.video_id) {
    throw new Error(`HeyGen generate failed (${res.status}): ${JSON.stringify(body.error ?? body)}`);
  }
  return body.data.video_id;
}

export interface HeygenStatus {
  status: 'pending' | 'waiting' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: unknown;
}

export async function getVideoStatus(videoId: string): Promise<HeygenStatus> {
  const res = await fetch(`${API}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`, {
    headers: { 'X-Api-Key': apiKey() },
    cache: 'no-store',
  });
  const body = (await res.json()) as { data?: HeygenStatus };
  if (!res.ok || !body.data) throw new Error(`HeyGen status failed (${res.status})`);
  return body.data;
}
