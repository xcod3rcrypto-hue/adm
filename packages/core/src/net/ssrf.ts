import { isIP } from 'node:net';

/**
 * Determina se um endereço IP é público e roteável. Bloqueia loopback, redes
 * privadas, link-local (inclui metadados de nuvem 169.254.169.254), CGNAT,
 * multicast, faixas reservadas/documentação e endereços IPv4 mapeados em IPv6.
 */
export function isPublicIp(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return isPublicIpv4(address);
  if (family === 6) return isPublicIpv6(address);
  return false;
}

function isPublicIpv4(ip: string): boolean {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b, c] = p as [number, number, number, number];
  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
  if (a === 169 && b === 254) return false; // link-local / metadados
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
  if (a === 198 && (b === 18 || b === 19)) return false; // benchmarking
  if (a === 198 && b === 51 && c === 100) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  if (a >= 224) return false; // multicast + reservado + broadcast
  return true;
}

function expandIpv6(ip: string): number[] | null {
  let addr = ip.toLowerCase();
  const zone = addr.indexOf('%');
  if (zone >= 0) addr = addr.slice(0, zone);
  // IPv4 embutido no final (ex.: ::ffff:1.2.3.4)
  const v4 = addr.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) {
    const parts = v4[1]!.split('.').map(Number);
    const hex = `${((parts[0]! << 8) | parts[1]!).toString(16)}:${((parts[2]! << 8) | parts[3]!).toString(16)}`;
    addr = addr.slice(0, addr.length - v4[1]!.length) + hex;
  }
  const halves = addr.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0;
  const groups = [...head, ...Array(Math.max(fill, 0)).fill('0'), ...tail].map((g) => parseInt(g, 16));
  return groups.length === 8 && groups.every((g) => Number.isInteger(g) && g >= 0 && g <= 0xffff) ? groups : null;
}

function isPublicIpv6(ip: string): boolean {
  const g = expandIpv6(ip);
  if (!g) return false;
  if (g.every((x) => x === 0)) return false; // ::
  if (g.slice(0, 7).every((x) => x === 0) && g[7] === 1) return false; // ::1
  // IPv4 mapeado (::ffff:a.b.c.d) ou compatível
  if (g.slice(0, 5).every((x) => x === 0) && (g[5] === 0xffff || g[5] === 0)) {
    const v4 = `${g[6]! >> 8}.${g[6]! & 0xff}.${g[7]! >> 8}.${g[7]! & 0xff}`;
    return isPublicIpv4(v4);
  }
  const first = g[0]!;
  if ((first & 0xfe00) === 0xfc00) return false; // ULA fc00::/7
  if ((first & 0xffc0) === 0xfe80) return false; // link-local
  if ((first & 0xff00) === 0xff00) return false; // multicast
  if (first === 0x2001 && g[1] === 0x0db8) return false; // documentação
  if (first === 0x0064 && g[1] === 0xff9b) return false; // NAT64 (pode apontar para IPv4 privado)
  return true;
}

export function assertSafeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('URL inválida.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Somente URLs http(s) são permitidas.');
  if (url.username || url.password) throw new Error('URLs com credenciais não são permitidas.');
  if (url.port && url.port !== '80' && url.port !== '443') throw new Error('Somente as portas padrão 80/443 são permitidas.');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('Endereços locais não são permitidos.');
  }
  if (isIP(host) && !isPublicIp(host)) throw new Error('Endereços IP privados ou reservados não são permitidos.');
  return url;
}
