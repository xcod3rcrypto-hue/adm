import { ZodError } from 'zod';
import { AppError } from '@advertex/shared';
import { AiProviderError } from '@advertex/ai-core';
import { PlatformApiError, CircuitOpenError } from '@advertex/advertising-core';
import { redactString } from './redact';

/** Converte qualquer erro em AppError com mensagem segura para o usuário. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || '_';
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return new AppError('VALIDATION', 'Revise os campos destacados.', { cause: err, fieldErrors });
  }
  if (err instanceof AiProviderError) {
    return new AppError(err.kind === 'network' ? 'NETWORK' : 'EXTERNAL_API', err.message, { cause: err });
  }
  if (err instanceof PlatformApiError) {
    const label = err.platform === 'meta' ? 'Meta Ads' : 'Google Ads';
    return new AppError('EXTERNAL_API', `${label}: ${redactString(err.message)}`, { cause: err });
  }
  if (err instanceof CircuitOpenError) return new AppError('EXTERNAL_API', err.message, { cause: err });
  if (err instanceof Error && (err.name === 'AbortError' || /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|fetch failed/i.test(err.message))) {
    return new AppError('NETWORK', 'Falha de rede ao contatar o serviço externo. Verifique sua conexão.', { cause: err });
  }
  return new AppError('INTERNAL', 'Ocorreu um erro inesperado. Detalhes foram registrados no log de diagnóstico.', { cause: err });
}
