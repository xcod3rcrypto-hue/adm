/** Demo version of lib/browser: "external" redirects (Stripe) stay inside the demo router. */
export * from '../../lib/browser';
import { navigate } from './navigation';

export function goTo(url: string): void {
  if (url.startsWith('/')) navigate(url);
}
