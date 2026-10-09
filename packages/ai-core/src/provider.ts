import type { z } from 'zod';

export interface StructuredRequest<T> {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
  effort?: 'low' | 'medium' | 'high';
}

export interface GenerationUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface StructuredResult<T> {
  data: T;
  model: string;
  usage: GenerationUsage;
}

/** Contrato independente de provedor para geração de texto estruturado. */
export interface TextProvider {
  readonly id: string;
  readonly model: string;
  generateStructured<T>(req: StructuredRequest<T>): Promise<StructuredResult<T>>;
  ping(): Promise<{ model: string; reply: string }>;
}

export type AiErrorKind = 'auth' | 'rate_limit' | 'refusal' | 'invalid_output' | 'bad_request' | 'unavailable' | 'network' | 'truncated';

export class AiProviderError extends Error {
  constructor(
    readonly kind: AiErrorKind,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'AiProviderError';
  }
}
