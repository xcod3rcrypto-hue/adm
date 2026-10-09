import { AiProviderError } from './provider';

/** Modelos de imagem do Gemini ("Nano Banana"). O Pro tem mais qualidade e texto legível na imagem. */
export const GEMINI_IMAGE_MODELS = [
  { id: 'gemini-3-pro-image-preview', label: 'Nano Banana Pro (Gemini 3 Pro Image) — máxima qualidade' },
  { id: 'gemini-2.5-flash-image', label: 'Nano Banana (Gemini 2.5 Flash Image) — mais rápido e barato' },
] as const;
export const GEMINI_DEFAULT_IMAGE_MODEL = 'gemini-3-pro-image-preview';

export const IMAGE_ASPECT_RATIOS = ['1:1', '4:5', '9:16', '16:9', '3:4', '4:3', '2:3', '3:2', '5:4', '21:9'] as const;
export type ImageAspectRatio = (typeof IMAGE_ASPECT_RATIOS)[number];
export type ImageSize = '1K' | '2K' | '4K';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface GeneratedImage {
  mimeType: string;
  data: Uint8Array;
}

interface GeminiResponse {
  candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string; thought?: boolean; inlineData?: { mimeType?: string; data?: string } }> } }>;
  promptFeedback?: { blockReason?: string };
  error?: { code?: number; message?: string; status?: string };
}

const HOST = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Geração de imagens pela API do Gemini (generateContent com saída IMAGE).
 * A chave vai no cabeçalho x-goog-api-key, nunca na URL.
 */
export class GeminiImageProvider {
  constructor(
    private readonly opts: { apiKey: string; model?: string; fetchImpl?: FetchLike; timeoutMs?: number },
  ) {}

  get model(): string {
    return this.opts.model ?? GEMINI_DEFAULT_IMAGE_MODEL;
  }

  private async call(path: string, init: RequestInit): Promise<GeminiResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.opts.timeoutMs ?? 180_000);
    let res: Response;
    try {
      res = await (this.opts.fetchImpl ?? fetch)(`${HOST}/${path}`, {
        ...init,
        headers: { 'x-goog-api-key': this.opts.apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (err) {
      throw new AiProviderError('network', 'Não foi possível conectar à API do Gemini. Verifique a internet.', { cause: err });
    } finally {
      clearTimeout(timer);
    }
    const body = (await res.json().catch(() => ({}))) as GeminiResponse;
    if (!res.ok || body.error) {
      const msg = body.error?.message ?? `HTTP ${res.status}`;
      if (res.status === 400 && /API key/i.test(msg)) throw new AiProviderError('auth', 'Chave da API do Gemini inválida. Confira em Configurações → Geração de imagens.');
      if (res.status === 401 || res.status === 403) throw new AiProviderError('auth', `Chave do Gemini sem permissão para este modelo (${msg}).`);
      if (res.status === 404) throw new AiProviderError('bad_request', `Modelo "${this.model}" não encontrado na sua conta do Gemini. Escolha outro modelo em Configurações.`);
      if (res.status === 429) {
        // "limit: 0" / free_tier: o projeto da chave não tem cota para este modelo (sem faturamento ativo).
        if (/limit:\s*0\b|free_tier/i.test(msg)) {
          throw new AiProviderError(
            'rate_limit',
            `O modelo "${this.model}" não tem cota gratuita na sua chave. Ative o faturamento no projeto da chave em aistudio.google.com (Get API key → Configurar faturamento) e tente de novo; o custo é cobrado por imagem pelo Google. Detalhe: ${msg.slice(0, 200)}`,
          );
        }
        throw new AiProviderError('rate_limit', `Limite de requisições do Gemini atingido. Aguarde 1 minuto e tente de novo, ou gere menos variações por vez. Detalhe: ${msg.slice(0, 200)}`);
      }
      throw new AiProviderError(res.status >= 500 ? 'unavailable' : 'bad_request', `Gemini: ${msg}`);
    }
    return body;
  }

  /** Confirma que a chave funciona e o modelo existe (sem gerar imagem). */
  async ping(): Promise<{ model: string }> {
    await this.call(`models/${encodeURIComponent(this.model)}`, { method: 'GET' });
    return { model: this.model };
  }

  async generate(req: { prompt: string; aspectRatio: ImageAspectRatio; imageSize: ImageSize; references?: GeneratedImage[] }): Promise<{ images: GeneratedImage[]; text: string }> {
    const parts: Array<Record<string, unknown>> = [{ text: req.prompt }];
    for (const r of req.references ?? []) parts.push({ inlineData: { mimeType: r.mimeType, data: Buffer.from(r.data).toString('base64') } });
    const isPro = this.model.includes('pro');
    const body = await this.call(`models/${encodeURIComponent(this.model)}:generateContent`, {
      method: 'POST',
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: { aspectRatio: req.aspectRatio, ...(isPro ? { imageSize: req.imageSize } : {}) },
        },
      }),
    });
    if (body.promptFeedback?.blockReason) {
      throw new AiProviderError('refusal', `O Gemini recusou o pedido (${body.promptFeedback.blockReason}). Reescreva a descrição evitando conteúdo sensível.`);
    }
    const cand = body.candidates?.[0];
    const outParts = (cand?.content?.parts ?? []).filter((p) => !p.thought);
    const images = outParts
      .filter((p) => p.inlineData?.data)
      .map((p) => ({ mimeType: p.inlineData!.mimeType ?? 'image/png', data: new Uint8Array(Buffer.from(p.inlineData!.data!, 'base64')) }));
    const text = outParts.map((p) => p.text ?? '').join(' ').trim();
    if (images.length === 0) {
      const reason = cand?.finishReason && cand.finishReason !== 'STOP' ? ` (motivo: ${cand.finishReason})` : '';
      throw new AiProviderError('invalid_output', `O Gemini não retornou imagem${reason}. ${text ? `Resposta: ${text.slice(0, 200)}` : 'Tente reformular a descrição.'}`);
    }
    return { images, text };
  }
}
