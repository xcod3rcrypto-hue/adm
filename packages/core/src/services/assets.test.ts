import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import type { AppContext } from '../context';
import { makeTestContext } from '../testing';
import { createOrganization } from './organizations';
import { deleteAsset, detectFileType, importAssets, listAssets, resolveAssetFile, updateAssetTags } from './assets';
import { createCreative } from './creatives';

let ctx: AppContext;
let dir: string;
beforeEach(async () => {
  ctx = await makeTestContext();
  dir = mkdtempSync(join(tmpdir(), 'advertex-src-'));
});

function png(width: number, height: number, salt = 0): Buffer {
  const b = Buffer.alloc(40);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  b[39] = salt;
  return b;
}

describe('detecção de tipo por assinatura', () => {
  it('reconhece PNG com dimensões e rejeita conteúdo arbitrário', () => {
    expect(detectFileType(png(1080, 1350))).toMatchObject({ mime: 'image/png', width: 1080, height: 1350 });
    expect(detectFileType(Buffer.from('<script>alert(1)</script>'))).toBeNull();
    const gif = Buffer.from('GIF89a\x10\x00\x20\x00', 'binary');
    expect(detectFileType(gif)).toMatchObject({ mime: 'image/gif', width: 16, height: 32 });
  });
});

describe('importação de ativos', () => {
  it('importa, deduplica por hash, rejeita formatos inválidos e não confia na extensão', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const a = join(dir, 'banner.png');
    const dup = join(dir, 'copia.png');
    const fake = join(dir, 'virus.png');
    writeFileSync(a, png(1200, 628));
    writeFileSync(dup, png(1200, 628));
    writeFileSync(fake, 'MZ executável disfarçado');

    const r = importAssets(ctx, org.id, null, [a, dup, fake]);
    expect(r.imported).toHaveLength(1);
    expect(r.imported[0]).toMatchObject({ fileName: 'banner.png', mimeType: 'image/png', width: 1200, height: 628 });
    expect(r.skipped.map((s) => s.fileName)).toEqual(['copia.png', 'virus.png']);

    const file = resolveAssetFile(ctx, r.imported[0]!.id);
    expect(file && existsSync(file.path)).toBe(true);
    expect(file!.path.startsWith(ctx.assetsDir)).toBe(true);

    const tagged = updateAssetTags(ctx, org.id, r.imported[0]!.id, ['Feed', 'feed', 'stories']);
    expect(tagged.tags).toEqual(['feed', 'stories']);
    expect(listAssets(ctx, org.id, null, 'stories')).toHaveLength(1);
  });

  it('impede excluir ativo vinculado e remove o arquivo ao excluir', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const p = join(dir, 'a.png');
    writeFileSync(p, png(10, 10, 7));
    const asset = importAssets(ctx, org.id, null, [p]).imported[0]!;
    const c = createCreative(ctx, org.id, { title: 'C', kind: 'generic', body: 'x', assetIds: [asset.id] });
    expect(() => deleteAsset(ctx, org.id, asset.id)).toThrow(/vinculado/);
    ctx.db.run("UPDATE creatives SET asset_ids = '[]' WHERE id = ?", [c.id]);
    const path = resolveAssetFile(ctx, asset.id)!.path;
    deleteAsset(ctx, org.id, asset.id);
    expect(existsSync(path)).toBe(false);
  });

  it('não expõe arquivos fora do diretório de ativos', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    ctx.db.run(
      "INSERT INTO assets (id, organization_id, file_name, stored_name, mime_type, size_bytes, sha256, created_at) VALUES ('00000000-0000-4000-8000-0000000000ff', ?, 'x', '../../etc/passwd', 'image/png', 1, 'h', 'n')",
      [org.id],
    );
    expect(resolveAssetFile(ctx, '00000000-0000-4000-8000-0000000000ff')).toBeNull();
  });
});
