/** next/headers for the demo build: no request, so every header and cookie is absent. */
const empty = { get: (_name: string): string | null => null };

export function headers() {
  return empty;
}

export function cookies() {
  return { get: (_name: string): { value: string } | undefined => undefined };
}
