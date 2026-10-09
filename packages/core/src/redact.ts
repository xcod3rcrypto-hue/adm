const SENSITIVE_KEY = /(token|secret|password|passwd|api[-_]?key|authorization|cookie|credential|refresh|access[-_]?key|client[-_]?secret)/i;
// Padrões de credenciais conhecidas que podem aparecer em mensagens de erro.
const SENSITIVE_VALUE = [
  /sk-ant-[A-Za-z0-9_-]{8,}/g,
  /EAA[A-Za-z0-9]{20,}/g, // tokens de acesso Meta
  /ya29\.[A-Za-z0-9._-]{10,}/g, // access tokens Google
  /1\/\/[A-Za-z0-9._-]{20,}/g, // refresh tokens Google
  /Bearer\s+[A-Za-z0-9._~+/=-]{10,}/gi,
];
const SENSITIVE_QUERY = /([?&](?:access_token|key|token|client_secret)=)[^&\s]+/gi;

export function redactString(s: string): string {
  let out = s.replace(SENSITIVE_QUERY, '$1[REDACTED]');
  for (const re of SENSITIVE_VALUE) out = out.replace(re, '[REDACTED]');
  return out;
}

/** Remove segredos de estruturas arbitrárias antes de logar/auditar. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[…]';
  if (typeof value === 'string') return redactString(value);
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value instanceof Error) return { name: value.name, message: redactString(value.message) };
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = SENSITIVE_KEY.test(k) ? '[REDACTED]' : redact(v, depth + 1);
    return out;
  }
  return value;
}
