import type { Channel, ChannelInput, ChannelOutputs, ErrorCode, IpcResult } from '@advertex/shared';

export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly correlationId: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Chamada tipada ao processo principal. Lança ApiError em caso de falha. */
export async function api<C extends Channel>(channel: C, ...args: ChannelInput<C> extends undefined ? [] : [ChannelInput<C>]): Promise<ChannelOutputs[C]> {
  if (!window.advertex) throw new ApiError('INTERNAL', 'Ponte com o aplicativo indisponível.', '');
  const res = (await window.advertex.invoke(channel, args[0])) as IpcResult<ChannelOutputs[C]>;
  if (!res.ok) throw new ApiError(res.error.code, res.error.message, res.error.correlationId, res.error.fieldErrors);
  return res.data;
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Erro desconhecido.';
}
