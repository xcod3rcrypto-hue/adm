/**
 * Checks every dictionary in lib/i18n against en.ts:
 *  - same keys and array lengths (TypeScript also enforces this),
 *  - the same {placeholders} in every string,
 *  - protected tokens kept verbatim (brand, plan names, coupon, DOIs, links),
 *  - no empty strings, and no strings accidentally left identical to English
 *    (except proper nouns / codes listed below).
 *
 *   npm run i18n:check            all locales
 *   npm run i18n:check -- it nl   only these
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = join(process.cwd(), 'lib', 'i18n');
const NOT_DICTIONARIES = new Set(['index', 'dictionaries', 'load', 'locales', 'neutral']);
const PROTECTED = ['VitalRise', 'VITAL10', 'Kit 3', 'Kit 6', '10.1159/000351376', '10.1185/030079908X291967', '37432180'];
// Strings allowed to stay identical to English (names, codes, numbers).
const SAME_OK = /^(VitalRise|VITAL10|OK|Kit \d|\d|[\d–+ ]+|https?:\/\/\S+|(DOI|PMID) \S+|.*et al\.,.*)$/;

type Node = string | Node[] | { [k: string]: Node };

function flatten(node: Node, path = '', out = new Map<string, string>()): Map<string, string> {
  if (typeof node === 'string') out.set(path, node);
  else if (Array.isArray(node)) node.forEach((v, i) => flatten(v, `${path}[${i}]`, out));
  else for (const [k, v] of Object.entries(node)) flatten(v, path ? `${path}.${k}` : k, out);
  return out;
}

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

const wanted = process.argv.slice(2);
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.ts') && !NOT_DICTIONARIES.has(f.replace(/\.ts$/, '')) && f !== 'en.ts')
  .filter((f) => !wanted.length || wanted.includes(f.replace(/\.ts$/, '')));

const load = async (file: string) => {
  const mod = (await import(pathToFileURL(join(dir, file)).href)) as Record<string, Node>;
  const value = Object.values(mod).find((v) => v && typeof v === 'object');
  if (!value) throw new Error(`${file}: no exported dictionary`);
  return flatten(value);
};

async function main() {
  const en = await load('en.ts');
  let failures = 0;
  for (const file of files) {
    const code = file.replace(/\.ts$/, '');
    const issues: string[] = [];
    let dict: Map<string, string>;
    try {
      dict = await load(file);
    } catch (error) {
      console.log(`✗ ${code}: ${(error as Error).message}`);
      failures += 1;
      continue;
    }
    let identical = 0;
    for (const [key, source] of en) {
      const value = dict.get(key);
      if (value === undefined) {
        issues.push(`missing ${key}`);
        continue;
      }
      if (!value.trim()) issues.push(`empty ${key}`);
      if (placeholders(value) !== placeholders(source)) issues.push(`placeholders differ at ${key}: "${placeholders(source)}" vs "${placeholders(value)}"`);
      for (const token of PROTECTED) if (source.includes(token) && !value.includes(token)) issues.push(`lost "${token}" at ${key}`);
      if (/^https?:\/\//.test(source) && value !== source) issues.push(`link changed at ${key}`);
      if (value === source && !SAME_OK.test(source) && source.length > 3) identical += 1;
    }
    for (const key of dict.keys()) if (!en.has(key)) issues.push(`extra ${key}`);
    if (identical > 8) issues.push(`${identical} strings identical to English — untranslated?`);
    if (issues.length) {
      failures += 1;
      console.log(`✗ ${code} (${issues.length})\n  ${issues.slice(0, 40).join('\n  ')}`);
    } else {
      console.log(`✓ ${code} — ${dict.size} strings`);
    }
  }
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
