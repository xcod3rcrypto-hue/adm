'use client';

/**
 * Browser access that never throws. Cookies and storage can be blocked
 * (private windows, sandboxed iframes, strict privacy settings) and the funnel
 * must keep working in memory when they are.
 */

export function readCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1] ?? '') : null;
  } catch {
    return null;
  }
}

export function writeCookie(name: string, value: string, maxAgeSeconds = 31_536_000): void {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
  } catch {
    // cookies blocked — the in-memory state still applies for this visit
  }
}

const memory = new Map<string, string>();
const memoryStorage: Storage = {
  get length() {
    return memory.size;
  },
  clear: () => memory.clear(),
  getItem: (k) => memory.get(k) ?? null,
  key: (i) => [...memory.keys()][i] ?? null,
  removeItem: (k) => void memory.delete(k),
  setItem: (k, v) => void memory.set(k, String(v)),
};

/** localStorage when it is usable, otherwise an in-memory stand-in for this page view. */
export function safeStorage(): Storage {
  try {
    const probe = '__rc_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryStorage;
  }
}

/** Leaves the app for an external page (Stripe Checkout, 3-D Secure). */
export function goTo(url: string): void {
  window.location.assign(url);
}
