#!/usr/bin/env node
/**
 * Gera os ícones do aplicativo a partir da mesma geometria do componente
 * Logo.tsx (sem dependências externas): build/icon.png (512px) e
 * build/icon.ico (16–256px, PNG embutido), usados pelo electron-builder.
 *
 * Uso: npm run icons
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(root, 'build');

// Paleta do gradiente (Logo.tsx): #7c5cff → #4f8cff → #22d3ee
const STOPS = [
  [0, [0x7c, 0x5c, 0xff]],
  [0.55, [0x4f, 0x8c, 0xff]],
  [1, [0x22, 0xd3, 0xee]],
];
const DARK = [0x0b, 0x0d, 0x12];
const WHITE = [0xff, 0xff, 0xff];

function gradient(t) {
  for (let i = 1; i < STOPS.length; i += 1) {
    const [t1, c1] = STOPS[i];
    const [t0, c0] = STOPS[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return c0.map((v, j) => v + (c1[j] - v) * k);
    }
  }
  return STOPS[STOPS.length - 1][1];
}

/** Ponto dentro do retângulo arredondado 64×64, raio 16 (coordenadas do SVG). */
function inRoundRect(x, y) {
  const r = 16;
  const cx = Math.min(Math.max(x, r), 64 - r);
  const cy = Math.min(Math.max(y, r), 64 - r);
  return x >= 0 && y >= 0 && x <= 64 && y <= 64 && (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

// Path do "A": M32 13 L50 51 H41.5 L32 30 L22.5 51 H14 Z
const POLY = [
  [32, 13],
  [50, 51],
  [41.5, 51],
  [32, 30],
  [22.5, 51],
  [14, 51],
];

function inPolygon(x, y) {
  let inside = false;
  for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i, i += 1) {
    const [xi, yi] = POLY[i];
    const [xj, yj] = POLY[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const inCircle = (x, y) => (x - 32) ** 2 + (y - 44) ** 2 <= 16;

/** Rasteriza com supersampling 4×4 e retorna RGBA. */
function render(size) {
  const px = new Uint8Array(size * size * 4);
  const ss = 4;
  for (let py = 0; py < size; py += 1) {
    for (let pxl = 0; pxl < size; pxl += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < ss; sy += 1) {
        for (let sx = 0; sx < ss; sx += 1) {
          const x = ((pxl + (sx + 0.5) / ss) / size) * 64;
          const y = ((py + (sy + 0.5) / ss) / size) * 64;
          if (!inRoundRect(x, y)) continue;
          let c = gradient((x + y) / 128);
          if (inPolygon(x, y)) c = WHITE;
          if (inCircle(x, y)) c = DARK;
          r += c[0];
          g += c[1];
          b += c[2];
          a += 1;
        }
      }
      const i = (py * size + pxl) * 4;
      const n = ss * ss;
      if (a > 0) {
        px[i] = Math.round(r / a);
        px[i + 1] = Math.round(g / a);
        px[i + 2] = Math.round(b / a);
      }
      px[i + 3] = Math.round((a / n) * 255);
    }
  }
  return px;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(size) {
  const rgba = render(size);
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0; // filtro "None"
    Buffer.from(rgba.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // profundidade
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function ico(sizes) {
  const images = sizes.map((s) => ({ size: s, data: png(s) }));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // tipo: ícone
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach((img, i) => {
    const o = i * 16;
    dir[o] = img.size >= 256 ? 0 : img.size;
    dir[o + 1] = img.size >= 256 ? 0 : img.size;
    dir[o + 2] = 0;
    dir[o + 3] = 0;
    dir.writeUInt16LE(1, o + 4); // planos
    dir.writeUInt16LE(32, o + 6); // bits por pixel
    dir.writeUInt32LE(img.data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += img.data.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'icon.png'), png(512));
writeFileSync(join(outDir, 'icon.ico'), ico([16, 24, 32, 48, 64, 128, 256]));
process.stdout.write(`Ícones gerados em ${outDir}\n`);
