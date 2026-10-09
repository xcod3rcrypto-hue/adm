import { contextBridge, ipcRenderer } from 'electron';
import { CHANNEL_NAMES, IPC_CHANNEL } from '../../../../packages/shared/src/channels';

type Channel = (typeof CHANNEL_NAMES)[number];

const allowed = new Set<string>(CHANNEL_NAMES);

/**
 * Única superfície exposta ao renderer: `invoke(canal, payload)`.
 * Sem acesso a ipcRenderer, Node.js ou eventos arbitrários.
 */
const api = {
  invoke(channel: Channel, payload?: unknown): Promise<unknown> {
    if (!allowed.has(channel)) return Promise.reject(new Error(`Canal não permitido: ${String(channel)}`));
    return ipcRenderer.invoke(IPC_CHANNEL, channel, payload);
  },
  platform: process.platform,
};

contextBridge.exposeInMainWorld('advertex', api);
