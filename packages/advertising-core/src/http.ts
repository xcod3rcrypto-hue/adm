/**
 * Cliente HTTP resiliente para APIs oficiais: timeout, retentativas com backoff
 * exponencial + jitter apenas para erros transitórios, e circuit breaker simples.
 * Somente requisições idempotentes (leituras) devem usar retentativas.
 */

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface RetryOptions {
  retries: number;
  baseDelayMs: number;
  timeoutMs: number;
  sleep?: (ms: number) => Promise<void>;
}

export const defaultRetry: RetryOptions = { retries: 3, baseDelayMs: 500, timeoutMs: 30_000 };

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

export class CircuitBreaker {
  private failures = 0;
  private openedAt: number | null = null;

  constructor(
    private readonly threshold = 5,
    private readonly cooldownMs = 60_000,
    private readonly now: () => number = Date.now,
  ) {}

  canRequest(): boolean {
    if (this.openedAt === null) return true;
    if (this.now() - this.openedAt >= this.cooldownMs) {
      this.openedAt = null; // meio-aberto: permite uma tentativa
      this.failures = this.threshold - 1;
      return true;
    }
    return false;
  }

  success(): void {
    this.failures = 0;
    this.openedAt = null;
  }

  failure(): void {
    this.failures += 1;
    if (this.failures >= this.threshold) this.openedAt = this.now();
  }
}

export class CircuitOpenError extends Error {
  constructor() {
    super('Muitas falhas consecutivas na API; novas tentativas pausadas por 1 minuto.');
    this.name = 'CircuitOpenError';
  }
}

/**
 * Executa `fetch` com timeout e retentativas. Retorna a última resposta (mesmo
 * com erro HTTP) para o chamador interpretar o corpo de erro da plataforma.
 */
export async function fetchWithRetry(
  fetchImpl: FetchLike,
  url: string,
  init: RequestInit,
  opts: RetryOptions = defaultRetry,
  breaker?: CircuitBreaker,
): Promise<Response> {
  const sleep = opts.sleep ?? defaultSleep;
  let attempt = 0;
  for (;;) {
    if (breaker && !breaker.canRequest()) throw new CircuitOpenError();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
    try {
      const res = await fetchImpl(url, { ...init, signal: controller.signal });
      if (isRetryableStatus(res.status) && attempt < opts.retries) {
        breaker?.failure();
        attempt += 1;
        const retryAfter = Number(res.headers.get('retry-after'));
        const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : backoff(opts.baseDelayMs, attempt);
        await sleep(delay);
        continue;
      }
      if (res.status >= 500) breaker?.failure();
      else breaker?.success();
      return res;
    } catch (err) {
      breaker?.failure();
      if (attempt >= opts.retries) throw err;
      attempt += 1;
      await sleep(backoff(opts.baseDelayMs, attempt));
    } finally {
      clearTimeout(timer);
    }
  }
}

function backoff(base: number, attempt: number): number {
  const exp = base * 2 ** (attempt - 1);
  return Math.min(exp + Math.random() * base, 20_000);
}
