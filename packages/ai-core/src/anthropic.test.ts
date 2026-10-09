import Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { AnthropicProvider, mapError } from './anthropic';
import { AiProviderError } from './provider';

const schema = z.object({ variations: z.array(z.object({ text: z.string(), rationale: z.string() })) });

function client(parse: (...args: unknown[]) => unknown) {
  return { beta: { messages: { parse: vi.fn(parse), create: vi.fn() } } } as unknown as Pick<Anthropic, 'beta'>;
}

describe('AnthropicProvider', () => {
  it('usa saída estruturada, fallback de servidor e valida o resultado', async () => {
    const c = client(async () => ({
      stop_reason: 'end_turn',
      model: 'claude-opus-5-5',
      parsed_output: { variations: [{ text: 'Olá', rationale: 'r' }] },
      usage: { input_tokens: 10, output_tokens: 5 },
    }));
    const p = new AnthropicProvider({ apiKey: 'k', client: c });
    const r = await p.generateStructured({ system: 's', prompt: 'p', schema });
    expect(r).toEqual({ data: { variations: [{ text: 'Olá', rationale: 'r' }] }, model: 'claude-opus-5-5', usage: { inputTokens: 10, outputTokens: 5 } });
    const args = (c.beta.messages.parse as unknown as ReturnType<typeof vi.fn>).mock.calls[0]![0] as Record<string, unknown>;
    expect(args.model).toBe('claude-opus-5-5');
    expect(args.fallbacks).toBe('default');
    expect(args.betas).toEqual(['server-side-fallback-2026-07-01']);
    expect((args.output_config as { format: { type: string } }).format.type).toBe('json_schema');
    expect(args).not.toHaveProperty('thinking');
  });

  it('trata recusa e truncamento sem fingir sucesso', async () => {
    const refusal = new AnthropicProvider({ apiKey: 'k', client: client(async () => ({ stop_reason: 'refusal', parsed_output: null, usage: {} })) });
    await expect(refusal.generateStructured({ system: 's', prompt: 'p', schema })).rejects.toMatchObject({ kind: 'refusal' });
    const truncated = new AnthropicProvider({ apiKey: 'k', client: client(async () => ({ stop_reason: 'max_tokens', parsed_output: null, usage: {} })) });
    await expect(truncated.generateStructured({ system: 's', prompt: 'p', schema })).rejects.toMatchObject({ kind: 'truncated' });
    const invalid = new AnthropicProvider({ apiKey: 'k', client: client(async () => ({ stop_reason: 'end_turn', parsed_output: { foo: 1 }, usage: {} })) });
    await expect(invalid.generateStructured({ system: 's', prompt: 'p', schema })).rejects.toMatchObject({ kind: 'invalid_output' });
  });

  it('mapeia erros tipados do SDK', () => {
    const auth = new Anthropic.AuthenticationError(401, { type: 'error' }, 'invalid x-api-key', new Headers());
    expect(mapError(auth)).toMatchObject({ kind: 'auth' });
    const rate = new Anthropic.RateLimitError(429, { type: 'error' }, 'rate', new Headers());
    expect(mapError(rate)).toMatchObject({ kind: 'rate_limit' });
    expect(mapError(new AiProviderError('refusal', 'x')).kind).toBe('refusal');
  });
});
