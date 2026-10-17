'use client';

/**
 * Thin wrapper over GA4, Meta Pixel and PostHog. Every call is a no-op until the visitor
 * accepts cookies (the scripts are only injected after consent — see components/Analytics.tsx).
 */
type Props = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    posthog?: { capture: (event: string, props?: Props) => void };
  }
}

const META_EVENTS: Record<string, string> = {
  quiz_complete: 'Lead',
  view_offer: 'ViewContent',
  begin_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
};

/** eventId: lets Meta merge this browser event with the same server event (Conversions API). */
/**
 * Never sent to Meta: quiz answers about the person (age, gender, persona). They can get a
 * health & wellness pixel restricted and are not needed for ad optimization.
 */
const META_BLOCKED = new Set(['age', 'persona_gender', 'persona']);

export function track(event: string, props: Props = {}, eventId?: string): void {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', event, props);
  window.posthog?.capture(event, props);
  const meta = META_EVENTS[event];
  const metaProps = Object.fromEntries(Object.entries(props).filter(([key]) => !META_BLOCKED.has(key)));
  if (meta) window.fbq?.('track', meta, metaProps, eventId ? { eventID: eventId } : undefined);
  else window.fbq?.('trackCustom', event, metaProps);
}

export const CONSENT_KEY = 'rc_consent';

export function readConsent(): 'granted' | 'denied' | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}
