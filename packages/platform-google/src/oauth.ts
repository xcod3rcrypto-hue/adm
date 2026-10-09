import { createHash, randomBytes } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { FetchLike } from '@advertex/advertising-core';

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
export const ADWORDS_SCOPE = 'https://www.googleapis.com/auth/adwords';

const b64url = (buf: Buffer) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = b64url(randomBytes(48));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

export function buildAuthUrl(p: { clientId: string; redirectUri: string; challenge: string; state: string }): string {
  const u = new URL(GOOGLE_AUTH_URL);
  u.searchParams.set('client_id', p.clientId);
  u.searchParams.set('redirect_uri', p.redirectUri);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('scope', ADWORDS_SCOPE);
  u.searchParams.set('code_challenge', p.challenge);
  u.searchParams.set('code_challenge_method', 'S256');
  u.searchParams.set('state', p.state);
  u.searchParams.set('access_type', 'offline');
  u.searchParams.set('prompt', 'consent');
  return u.toString();
}

export interface TokenSet {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  scope: string;
}

async function tokenRequest(fetchImpl: FetchLike, body: Record<string, string>): Promise<TokenSet> {
  const res = await fetchImpl(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams(body).toString(),
  });
  const json = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !json.access_token) {
    const reason = json.error === 'invalid_grant' ? 'Autorização expirada ou revogada. Autorize novamente.' : (json.error_description ?? json.error ?? `HTTP ${res.status}`);
    throw new Error(`Falha ao obter token do Google: ${reason}`);
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
    scope: json.scope ?? '',
  };
}

export function exchangeCode(
  fetchImpl: FetchLike,
  p: { code: string; clientId: string; clientSecret: string; redirectUri: string; verifier: string },
): Promise<TokenSet> {
  return tokenRequest(fetchImpl, {
    grant_type: 'authorization_code',
    code: p.code,
    client_id: p.clientId,
    client_secret: p.clientSecret,
    redirect_uri: p.redirectUri,
    code_verifier: p.verifier,
  });
}

export function refreshAccessToken(fetchImpl: FetchLike, p: { refreshToken: string; clientId: string; clientSecret: string }): Promise<TokenSet> {
  return tokenRequest(fetchImpl, {
    grant_type: 'refresh_token',
    refresh_token: p.refreshToken,
    client_id: p.clientId,
    client_secret: p.clientSecret,
  });
}

export async function revokeToken(fetchImpl: FetchLike, token: string): Promise<boolean> {
  const res = await fetchImpl(GOOGLE_REVOKE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }).toString(),
  });
  return res.ok;
}

const PAGE = (title: string, msg: string) =>
  `<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font-family:Segoe UI,sans-serif;background:#0b0d12;color:#e7e9ee;display:grid;place-items:center;height:100vh;margin:0"><div><h2>${title}</h2><p>${msg}</p></div>`;

/**
 * Fluxo OAuth para apps desktop (RFC 8252): servidor de loopback efêmero em
 * 127.0.0.1, porta aleatória, PKCE S256 e verificação de `state`.
 */
export async function runLoopbackAuthorization(p: {
  clientId: string;
  clientSecret: string;
  openBrowser: (url: string) => Promise<void>;
  fetchImpl: FetchLike;
  timeoutMs?: number;
}): Promise<TokenSet> {
  const { verifier, challenge } = createPkcePair();
  const state = b64url(randomBytes(24));
  let server: Server | undefined;

  const codePromise = new Promise<{ code: string; redirectUri: string }>((resolve, reject) => {
    server = createServer((req, res) => {
      const addr = server?.address() as AddressInfo;
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${addr.port}`);
      if (url.pathname !== '/') {
        res.writeHead(404).end();
        return;
      }
      const error = url.searchParams.get('error');
      const code = url.searchParams.get('code');
      const st = url.searchParams.get('state');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      if (error) {
        res.end(PAGE('Autorização cancelada', 'Você pode fechar esta janela e voltar ao ADVERTEX AI Studio.'));
        reject(new Error(error === 'access_denied' ? 'Autorização negada pelo usuário.' : `Erro do Google: ${error}`));
      } else if (!code || st !== state) {
        res.end(PAGE('Resposta inválida', 'Parâmetros de autorização inválidos.'));
        reject(new Error('Resposta de autorização inválida (state divergente).'));
      } else {
        res.end(PAGE('Conta autorizada', 'Pode fechar esta janela e voltar ao ADVERTEX AI Studio.'));
        resolve({ code, redirectUri: `http://127.0.0.1:${addr.port}` });
      }
    });
    server.on('error', reject);
  });

  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
  const port = (server!.address() as AddressInfo).port;
  const redirectUri = `http://127.0.0.1:${port}`;
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Tempo esgotado aguardando a autorização no navegador.')), p.timeoutMs ?? 5 * 60_000),
  );

  try {
    await p.openBrowser(buildAuthUrl({ clientId: p.clientId, redirectUri, challenge, state }));
    const { code } = await Promise.race([codePromise, timeout]);
    return await exchangeCode(p.fetchImpl, { code, clientId: p.clientId, clientSecret: p.clientSecret, redirectUri, verifier });
  } finally {
    server?.close();
  }
}
