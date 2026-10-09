import { randomUUID } from 'node:crypto';
import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import { AppError, IPC_CHANNEL, ipcInputs, type Channel, type ChannelOutputs, type ChannelParsed, type IpcResult } from '@advertex/shared';
import { toAppError, type AppContext } from '@advertex/core';

export type Handler<C extends Channel> = (input: ChannelParsed<C>, ctx: AppContext, event: IpcMainInvokeEvent) => Promise<ChannelOutputs[C]> | ChannelOutputs[C];
export type HandlerMap = { [C in Channel]: Handler<C> };

/**
 * Roteador IPC único: valida a origem do remetente, o nome do canal e o payload
 * (Zod) antes de chamar o serviço. Erros viram respostas estruturadas com ID
 * de correlação, sem stack trace nem segredos.
 */
export function registerIpc(baseCtx: AppContext, handlers: HandlerMap, isTrustedSender: (e: IpcMainInvokeEvent) => boolean): void {
  ipcMain.handle(IPC_CHANNEL, async (event, channel: unknown, payload: unknown): Promise<IpcResult<unknown>> => {
    const correlationId = randomUUID();
    const started = Date.now();
    const ctx: AppContext = { ...baseCtx, correlationId };
    try {
      if (!isTrustedSender(event)) throw new AppError('FORBIDDEN', 'Origem não autorizada.');
      if (typeof channel !== 'string' || !Object.hasOwn(ipcInputs, channel)) throw new AppError('FORBIDDEN', 'Canal não permitido.');
      const c = channel as Channel;
      const input = ipcInputs[c].parse(payload);
      const handler = handlers[c] as Handler<Channel>;
      const data = await handler(input as never, ctx, event);
      ctx.logger.debug('ipc', { channel: c, correlationId, ms: Date.now() - started });
      return { ok: true, data };
    } catch (err) {
      const appErr = toAppError(err);
      const level = appErr.code === 'INTERNAL' ? 'error' : 'warn';
      ctx.logger[level]('ipc.error', {
        channel: String(channel),
        correlationId,
        code: appErr.code,
        message: appErr.message,
        cause: err instanceof Error ? { name: err.name, message: err.message, stack: appErr.code === 'INTERNAL' ? err.stack : undefined } : String(err),
      });
      return { ok: false, error: { code: appErr.code, message: appErr.message, correlationId, fieldErrors: appErr.fieldErrors } };
    }
  });
}
