import type { Channel } from '@advertex/shared';

declare global {
  interface Window {
    advertex: {
      invoke(channel: Channel, payload?: unknown): Promise<unknown>;
      platform: string;
    };
  }
}

export {};
