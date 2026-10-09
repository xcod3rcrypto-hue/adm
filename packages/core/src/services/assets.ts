import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, openSync, readSync, closeSync, statSync, unlinkSync, readFileSync } from 'node:fs';
import { basename, join, resolve, sep } from 'node:path';
import { AppError, type Asset } from '@advertex/shared';
import type { AppContext } from '../context';
import { parseJson, requireOrg, requireOwned } from '../util';
import { recordAudit } from './audit';

export const MAX_ASSET_BYTES = 50 * 1024 * 1024;

interface Detected {
  mime: string;
  ext: string;
  width: number | null;
  height: number | null;
}

/** Detecta o tipo pelo conteúdo (assinatura), não pela extensão informada. */
export function detectFileType(buf: Buffer): Detected | null {
  if (buf.length >= 24 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: 'image/png', ext: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg', ...jpegSize(buf) };
  }
  if (buf.length >= 10 && (buf.subarray(0, 6).toString('ascii') === 'GIF87a' || buf.subarray(0, 6).toString('ascii') === 'GIF89a')) {
    return { mime: 'image/gif', ext: 'gif', width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  if (buf.length >= 30 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { mime: 'image/webp', ext: 'webp', ...webpSize(buf) };
  }
  if (buf.length >= 12 && buf.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buf.subarray(8, 12).toString('ascii');
    if (brand.startsWith('qt')) return { mime: 'video/quicktime', ext: 'mov', width: null, height: null };
    return { mime: 'video/mp4', ext: 'mp4', width: null, height: null };
  }
  if (buf.length >= 4 && buf.readUInt32BE(0) === 0x1a45dfa3) return { mime: 'video/webm', ext: 'webm', width: null, height: null };
  return null;
}

function jpegSize(buf: Buffer): { width: number | null; height: number | null } {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1]!;
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return { width: null, height: null };
}

function webpSize(buf: Buffer): { width: number | null; height: number | null } {
  const chunk = buf.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  if (chunk === 'VP8 ' && buf.length >= 30) return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L' && buf.length >= 25) {
    const b = buf.readUInt32LE(21);
    return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
  }
  return { width: null, height: null };
}

interface AssetRow {
  id: string;
  organization_id: string;
  project_id: string | null;
  file_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  width: number | null;
  height: number | null;
  tags: string;
  created_at: string;
}

const toAsset = (r: AssetRow): Asset => ({
  id: r.id,
  organizationId: r.organization_id,
  projectId: r.project_id,
  fileName: r.file_name,
  mimeType: r.mime_type,
  sizeBytes: r.size_bytes,
  sha256: r.sha256,
  width: r.width,
  height: r.height,
  tags: parseJson<string[]>(r.tags, []),
  createdAt: r.created_at,
});

function readHead(path: string, bytes = 64 * 1024): Buffer {
  const fd = openSync(path, 'r');
  try {
    const buf = Buffer.alloc(bytes);
    const n = readSync(fd, buf, 0, bytes, 0);
    return buf.subarray(0, n);
  } finally {
    closeSync(fd);
  }
}

export interface ImportResult {
  imported: Asset[];
  skipped: Array<{ fileName: string; reason: string }>;
}

export function importAssets(ctx: AppContext, organizationId: string, projectId: string | null, paths: string[]): ImportResult {
  requireOrg(ctx, organizationId);
  if (projectId) requireOwned(ctx, 'projects', projectId, organizationId, 'Projeto');
  const result: ImportResult = { imported: [], skipped: [] };
  const dir = join(ctx.assetsDir, organizationId);
  mkdirSync(dir, { recursive: true });

  for (const p of paths) {
    const fileName = basename(p).slice(0, 200);
    try {
      const st = statSync(p);
      if (!st.isFile()) throw new Error('Não é um arquivo.');
      if (st.size === 0) throw new Error('Arquivo vazio.');
      if (st.size > MAX_ASSET_BYTES) throw new Error('Arquivo maior que 50 MB.');
      const type = detectFileType(readHead(p));
      if (!type) throw new Error('Formato não suportado (use PNG, JPG, GIF, WEBP, MP4, MOV ou WEBM).');
      const sha256 = createHash('sha256').update(readFileSync(p)).digest('hex');
      const dup = ctx.db.get<AssetRow>('SELECT * FROM assets WHERE organization_id = ? AND sha256 = ?', [organizationId, sha256]);
      if (dup) {
        result.skipped.push({ fileName, reason: `Já existe na biblioteca como "${dup.file_name}".` });
        continue;
      }
      const id = ctx.newId();
      const storedName = `${organizationId}/${id}.${type.ext}`;
      copyFileSync(p, join(ctx.assetsDir, storedName));
      ctx.db.run(
        `INSERT INTO assets (id, organization_id, project_id, file_name, stored_name, mime_type, size_bytes, sha256, width, height, tags, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?)`,
        [id, organizationId, projectId, fileName, storedName, type.mime, st.size, sha256, type.width, type.height, ctx.now()],
      );
      recordAudit(ctx, { organizationId, action: 'asset.import', entityType: 'asset', entityId: id, details: { fileName, mime: type.mime, size: st.size } });
      result.imported.push(getAsset(ctx, organizationId, id));
    } catch (err) {
      result.skipped.push({ fileName, reason: err instanceof Error ? err.message : 'Falha desconhecida.' });
    }
  }
  return result;
}

export function listAssets(ctx: AppContext, organizationId: string, projectId: string | null, search = ''): Asset[] {
  requireOrg(ctx, organizationId);
  const where = ['organization_id = ?'];
  const params: string[] = [organizationId];
  if (projectId) {
    where.push('project_id = ?');
    params.push(projectId);
  }
  if (search) {
    where.push("(file_name LIKE ? ESCAPE '\\' OR tags LIKE ? ESCAPE '\\')");
    const q = `%${search.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
    params.push(q, q);
  }
  return ctx.db.all<AssetRow>(`SELECT * FROM assets WHERE ${where.join(' AND ')} ORDER BY created_at DESC`, params).map(toAsset);
}

export function getAsset(ctx: AppContext, organizationId: string, id: string): Asset {
  const row = ctx.db.get<AssetRow>('SELECT * FROM assets WHERE id = ? AND organization_id = ?', [id, organizationId]);
  if (!row) throw new AppError('NOT_FOUND', 'Ativo não encontrado.');
  return toAsset(row);
}

export function updateAssetTags(ctx: AppContext, organizationId: string, id: string, tags: string[]): Asset {
  getAsset(ctx, organizationId, id);
  const clean = [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];
  ctx.db.run('UPDATE assets SET tags = ? WHERE id = ? AND organization_id = ?', [JSON.stringify(clean), id, organizationId]);
  return getAsset(ctx, organizationId, id);
}

/**
 * Caminho absoluto do arquivo de um ativo. Usado pelo protocolo interno
 * advertex-asset:// — garante que o caminho permanece dentro de assetsDir.
 */
export function resolveAssetFile(ctx: AppContext, id: string): { path: string; mime: string } | null {
  const row = ctx.db.get<{ stored_name: string; mime_type: string }>('SELECT stored_name, mime_type FROM assets WHERE id = ?', [id]);
  if (!row) return null;
  const root = resolve(ctx.assetsDir);
  const full = resolve(root, row.stored_name);
  if (!full.startsWith(root + sep)) return null;
  return existsSync(full) ? { path: full, mime: row.mime_type } : null;
}

export function assetFilePath(ctx: AppContext, organizationId: string, id: string): { path: string; fileName: string } {
  const asset = getAsset(ctx, organizationId, id);
  const file = resolveAssetFile(ctx, id);
  if (!file) throw new AppError('NOT_FOUND', 'Arquivo do ativo não encontrado no disco.');
  return { path: file.path, fileName: asset.fileName };
}

export function deleteAsset(ctx: AppContext, organizationId: string, id: string): void {
  const asset = getAsset(ctx, organizationId, id);
  const used = ctx.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM creatives WHERE organization_id = ? AND asset_ids LIKE ?", [organizationId, `%"${id}"%`]);
  if (used && used.n > 0) throw new AppError('CONFLICT', `Este ativo está vinculado a ${used.n} criativo(s). Remova o vínculo antes de excluir.`);
  const file = resolveAssetFile(ctx, id);
  ctx.db.run('DELETE FROM assets WHERE id = ? AND organization_id = ?', [id, organizationId]);
  if (file) unlinkSync(file.path);
  recordAudit(ctx, { organizationId, action: 'asset.delete', entityType: 'asset', entityId: id, details: { fileName: asset.fileName } });
}
