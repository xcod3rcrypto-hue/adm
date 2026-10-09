import type { ErrorCode } from './ipc';

/**
 * Erro de aplicação com código estável e mensagem segura para exibir ao
 * usuário. Mensagens nunca devem conter segredos.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(code: ErrorCode, message: string, options?: { cause?: unknown; fieldErrors?: Record<string, string[]> }) {
    super(message, { cause: options?.cause });
    this.name = 'AppError';
    this.code = code;
    this.fieldErrors = options?.fieldErrors;
  }
}

export const notFound = (what: string) => new AppError('NOT_FOUND', `${what} não encontrado(a).`);
