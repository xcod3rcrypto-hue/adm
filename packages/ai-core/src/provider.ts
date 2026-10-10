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

/** Ferramenta que o modelo pode chamar durante uma conversa (Copiloto). */
export interface ChatTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ChatTurnRequest {
  system: string;
  /** Histórico no formato de mensagens da API (opaco para quem chama; reenviado sem edição). */
  messages: unknown[];
  tools: ChatTool[];
  maxTokens?: number;
  effort?: 'low' | 'medium' | 'high';
}

export interface ChatTurnResult {
  /** Blocos da resposta, a serem anexados ao histórico exatamente como vieram. */
  content: unknown[];
  stopReason: string;
  model: string;
  usage: GenerationUsage;
  text: string;
  toolCalls: Array<{ id: string; name: string; input: unknown }>;
}

/** Contrato independente de provedor para geração de texto estruturado. */
export interface TextProvider {
  readonly id: string;
  readonly model: string;
  generateStructured<T>(req: StructuredRequest<T>): Promise<StructuredResult<T>>;
  ping(): Promise<{ model: string; reply: string }>;
  /** Uma rodada de conversa com ferramentas (o laço fica com quem chama). */
  chatTurn?(req: ChatTurnRequest): Promise<ChatTurnResult>;
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
