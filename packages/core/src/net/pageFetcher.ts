import { lookup as dnsLookup, type LookupAddress } from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import type { LookupFunction } from 'node:net';
import zlib from 'node:zlib';
import type { PageAnalysis } from '@advertex/shared';
import { assertSafeUrl, isPublicIp } from './ssrf';

export interface FetchPageOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  /** Resolvedor DNS injetável (testes). */
  lookup?: (host: string) => Promise<LookupAddress[]>;
}

const UA = 'ADVERTEX-AI-Studio/0.1 (analise sob demanda de pagina publica)';

const defaultResolve = (host: string) =>
  new Promise<LookupAddress[]>((resolve, reject) => dnsLookup(host, { all: true }, (err, addrs) => (err ? reject(err) : resolve(addrs))));

/**
 * Lookup que valida TODOS os endereços resolvidos e fixa a conexão no endereço
 * validado (impede DNS rebinding entre validação e conexão).
 */
function safeLookup(resolve: (host: string) => Promise<LookupAddress[]>): LookupFunction {
  return (hostname, options, callback) => {
    resolve(hostname)
      .then((addrs) => {
        if (addrs.length === 0) throw new Error('Host sem endereços.');
        const bad = addrs.find((a) => !isPublicIp(a.address));
        if (bad) throw new Error('O domínio aponta para um endereço privado ou reservado.');
        const chosen = addrs[0]!;
        if (options.all) callback(null, addrs);
        else callback(null, chosen.address, chosen.family);
      })
      .catch((err: Error) => callback(err as NodeJS.ErrnoException, '', 0));
  };
}

interface RawResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: Buffer;
}

function requestOnce(url: URL, opts: Required<Pick<FetchPageOptions, 'timeoutMs' | 'maxBytes'>> & { lookup: LookupFunction }): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const mod = url.protocol === 'https:' ? https : http;
    const req = mod.request(
      url,
      {
        method: 'GET',
        lookup: opts.lookup,
        headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml', 'Accept-Encoding': 'gzip, deflate, br', 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.5' },
        timeout: opts.timeoutMs,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400) {
          res.resume();
          resolve({ status, headers: res.headers, body: Buffer.alloc(0) });
          return;
        }
        const ctype = String(res.headers['content-type'] ?? '');
        if (status < 400 && !/text\/html|application\/xhtml\+xml/i.test(ctype)) {
          res.destroy();
          reject(new Error(`Conteúdo não é uma página HTML (${ctype || 'tipo desconhecido'}).`));
          return;
        }
        const enc = String(res.headers['content-encoding'] ?? '').toLowerCase();
        const stream =
          enc === 'gzip' ? res.pipe(zlib.createGunzip()) : enc === 'deflate' ? res.pipe(zlib.createInflate()) : enc === 'br' ? res.pipe(zlib.createBrotliDecompress()) : res;
        const chunks: Buffer[] = [];
        let size = 0;
        stream.on('data', (c: Buffer) => {
          size += c.length;
          if (size > opts.maxBytes) {
            res.destroy();
            stream.destroy();
            // Página grande: usa o que já foi lido (suficiente para metadados).
            resolve({ status, headers: res.headers, body: Buffer.concat(chunks) });
            return;
          }
          chunks.push(c);
        });
        stream.on('end', () => resolve({ status, headers: res.headers, body: Buffer.concat(chunks) }));
        stream.on('error', reject);
      },
    );
    req.on('timeout', () => req.destroy(new Error('Tempo esgotado ao acessar a página.')));
    req.on('error', reject);
    req.end();
  });
}

export async function fetchPublicPage(rawUrl: string, options: FetchPageOptions = {}): Promise<PageAnalysis> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const maxBytes = options.maxBytes ?? 2 * 1024 * 1024;
  const maxRedirects = options.maxRedirects ?? 5;
  const lookup = safeLookup(options.lookup ?? defaultResolve);

  let url = assertSafeUrl(rawUrl);
  for (let i = 0; i <= maxRedirects; i += 1) {
    const res = await requestOnce(url, { timeoutMs, maxBytes, lookup });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.location;
      if (!loc) throw new Error('Redirecionamento sem destino.');
      url = assertSafeUrl(new URL(loc, url).toString());
      continue;
    }
    if (res.status === 401 || res.status === 403) throw new Error('A página exige autenticação ou bloqueou o acesso; não será contornado.');
    if (res.status >= 400) throw new Error(`A página respondeu com HTTP ${res.status}.`);
    return { ...extractPage(res.body.toString('utf8')), url: rawUrl, finalUrl: url.toString(), status: res.status, fetchedAt: new Date().toISOString() };
  }
  throw new Error('Redirecionamentos demais.');
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1]?.toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

const clean = (s: string) => decodeEntities(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Extração simples e determinística de metadados e texto visível. */
export function extractPage(html: string): Pick<PageAnalysis, 'title' | 'description' | 'headings' | 'textExcerpt'> {
  const noScripts = html.replace(/<(script|style|noscript|template|svg)[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  const title = clean(noScripts.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const metaDesc = (name: string) => {
    const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*>`, 'i');
    const tag = noScripts.match(re)?.[0];
    return tag ? clean(tag.match(/content=["']([^"']*)["']/i)?.[1] ?? '') : '';
  };
  const description = metaDesc('description') || metaDesc('og:description');
  const headings = [...noScripts.matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => clean(m[2] ?? ''))
    .filter((h) => h.length > 0)
    .slice(0, 25);
  const body = noScripts.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? noScripts;
  const textExcerpt = clean(body).slice(0, 4000);
  return { title, description, headings, textExcerpt };
}
