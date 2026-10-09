import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { AiProviderError, type StructuredRequest, type StructuredResult, type TextProvider } from './provider';

export const ANTHROPIC_DEFAULT_MODEL = 'claude-opus-5-5';
/** Fallback no servidor quando o classificador de segurança recusa (roteado por categoria). */
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

type MessagesClient = Pick<Anthropic, 'beta'>;

export interface AnthropicProviderOptions {
  apiKey: string;
  model?: string;
  /** Injetável para testes. */
  client?: MessagesClient;
  timeoutMs?: number;
}

export class AnthropicProvider implements TextProvider {
  readonly id = 'anthropic';
  readonly model: string;
  private readonly client: MessagesClient;

  constructor(opts: AnthropicProviderOptions) {
    this.model = opts.model ?? ANTHROPIC_DEFAULT_MODEL;
    this.client = opts.client ?? new Anthropic({ apiKey: opts.apiKey, timeout: opts.timeoutMs ?? 120_000, maxRetries: 2 });
  }

  async generateStructured<T>(req: StructuredRequest<T>): Promise<StructuredResult<T>> {
    try {
      const response = await this.client.beta.messages.parse({
        model: this.model,
        max_tokens: req.maxTokens ?? 16_000,
        system: req.system,
        messages: [{ role: 'user', content: req.prompt }],
        output_config: { effort: req.effort ?? 'medium', format: betaZodOutputFormat(req.schema) },
        betas: [FALLBACK_BETA],
        fallbacks: 'default',
      });

      if (response.stop_reason === 'refusal') {
        throw new AiProviderError('refusal', 'O modelo recusou esta solicitação. Revise o briefing ou as instruções e tente novamente.');
      }
      if (response.stop_reason === 'max_tokens') {
        throw new AiProviderError('truncated', 'A resposta foi interrompida pelo limite de tamanho. Reduza a quantidade de variações.');
      }
      const parsed = response.parsed_output;
      const validated = parsed === null || parsed === undefined ? null : req.schema.safeParse(parsed);
      if (!validated || !validated.success) {
        throw new AiProviderError('invalid_output', 'A resposta do modelo não seguiu o formato esperado. Tente novamente.');
      }
      return {
        data: validated.data,
        model: response.model,
        usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
      };
    } catch (err) {
      throw mapError(err);
    }
  }

  async ping(): Promise<{ model: string; reply: string }> {
    try {
      const response = await this.client.beta.messages.create({
        model: this.model,
        max_tokens: 1024,
        output_config: { effort: 'low' },
        messages: [{ role: 'user', content: 'Responda apenas com a palavra: conectado' }],
        betas: [FALLBACK_BETA],
        fallbacks: 'default',
      });
      const reply = response.content
        .filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim();
      return { model: response.model, reply };
    } catch (err) {
      throw mapError(err);
    }
  }
}

export function mapError(err: unknown): AiProviderError {
  if (err instanceof AiProviderError) return err;
  if (err instanceof Anthropic.AuthenticationError) return new AiProviderError('auth', 'Chave de API inválida ou revogada.', { cause: err });
  if (err instanceof Anthropic.PermissionDeniedError)
    return new AiProviderError('auth', 'A chave de API não tem permissão para este modelo.', { cause: err });
  if (err instanceof Anthropic.NotFoundError) return new AiProviderError('bad_request', 'Modelo não encontrado. Verifique o ID do modelo nas configurações.', { cause: err });
  if (err instanceof Anthropic.RateLimitError) return new AiProviderError('rate_limit', 'Limite de uso da API atingido. Aguarde e tente novamente.', { cause: err });
  if (err instanceof Anthropic.BadRequestError) return new AiProviderError('bad_request', `Solicitação rejeitada pela API: ${err.message}`, { cause: err });
  if (err instanceof Anthropic.APIConnectionError) return new AiProviderError('network', 'Sem conexão com a API da Anthropic.', { cause: err });
  if (err instanceof Anthropic.APIError) return new AiProviderError('unavailable', `Serviço indisponível (HTTP ${err.status ?? '?'}).`, { cause: err });
  return new AiProviderError('unavailable', err instanceof Error ? err.message : 'Falha desconhecida no provedor de IA.', { cause: err });
}
