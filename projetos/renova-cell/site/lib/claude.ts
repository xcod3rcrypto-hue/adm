import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { Locale } from './i18n';
import type { Currency } from './products';
import { chatSystemPrompt, headlinePrompt } from './prompts';
import { personaOf, type Persona, type QuizAnswers } from './quiz';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';

let client: Anthropic | null = null;
function anthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic();
  return client;
}

/**
 * Shared request options. `fallbacks: "default"` lets the API re-run a request on
 * Anthropic's recommended fallback model if the primary model declines it.
 */
const base = {
  model: MODEL,
  betas: ['server-side-fallback-2026-07-01'],
  fallbacks: 'default',
  output_config: { effort: 'low' },
} satisfies Partial<Anthropic.Beta.MessageCreateParamsNonStreaming>;

function textOf(content: Anthropic.Beta.BetaContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

/** 12-word emotional headline. Returns null on any failure so the page falls back to static copy. */
export async function generateHeadline(answers: QuizAnswers, locale: Locale): Promise<string | null> {
  const ai = anthropic();
  if (!ai) return null;
  const { system, user } = headlinePrompt(answers, personaOf(answers), locale);
  try {
    const res = await ai.beta.messages.create(
      { ...base, max_tokens: 2000, system, messages: [{ role: 'user', content: user }] },
      { timeout: 15_000 },
    );
    if (res.stop_reason === 'refusal') return null;
    const line = textOf(res.content).split('\n')[0]?.replace(/^["'“”]+|["'“”]+$/g, '').trim();
    if (!line) return null;
    return line.split(/\s+/).slice(0, 14).join(' ');
  } catch (error) {
    console.error('generateHeadline failed', error);
    return null;
  }
}

/**
 * Streams the assistant's reply as plain UTF-8 text chunks.
 * The caller pipes this straight into a Response body.
 */
export function chatStream(
  messages: Anthropic.Beta.BetaMessageParam[],
  locale: Locale,
  context: { persona?: Persona; plan?: string; currency?: Currency },
): ReadableStream<Uint8Array> {
  const ai = anthropic();
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      if (!ai) {
        controller.enqueue(encoder.encode('The assistant is not configured yet (missing ANTHROPIC_API_KEY).'));
        controller.close();
        return;
      }
      try {
        const stream = ai.beta.messages.stream({
          ...base,
          max_tokens: 4000,
          system: chatSystemPrompt(locale, context),
          messages,
        });
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        console.error('chatStream failed', error);
        controller.error(error);
      }
    },
  });
}
