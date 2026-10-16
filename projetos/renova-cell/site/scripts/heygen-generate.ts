/**
 * Generates the VSL videos with HeyGen and re-hosts them on Supabase Storage.
 *
 *   npm run vsl:generate -- --translate            # write es/fr/de scripts to scripts/vsl/ for review (Claude)
 *   npm run vsl:generate -- --dry-run              # show what would be generated
 *   npm run vsl:generate                           # all personas × all locales
 *   npm run vsl:generate -- --persona=woman --locale=pt
 *
 * Each video costs HeyGen credits. Already-completed persona/locale pairs are skipped
 * unless you pass --force.
 */
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateVSL, getVideoStatus } from '../lib/heygen-api';
import { LOCALES, type Locale } from '../lib/i18n';
import { translatePrompt } from '../lib/prompts';
import type { Persona } from '../lib/quiz';
import { VSL_SCRIPTS_EN, VSL_SCRIPTS_PT } from '../lib/vsl-scripts';

const PERSONAS: Persona[] = ['woman', 'man', 'senior'];
const SCRIPT_DIR = join(process.cwd(), 'scripts', 'vsl');

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'] as const;
  }),
);
const pick = <T extends string>(all: readonly T[], value?: string): T[] =>
  !value || value === 'all' ? [...all] : all.filter((x) => x === value);

const personas = pick(PERSONAS, args.get('persona'));
const locales = pick(LOCALES, args.get('locale'));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function scriptFor(persona: Persona, locale: Locale): string | null {
  if (locale === 'en') return VSL_SCRIPTS_EN[persona];
  if (locale === 'pt') return VSL_SCRIPTS_PT[persona];
  const file = join(SCRIPT_DIR, `${persona}.${locale}.txt`);
  return existsSync(file) ? readFileSync(file, 'utf8').trim() : null;
}

async function translateAll() {
  const ai = new Anthropic();
  for (const persona of personas) {
    for (const locale of locales.filter((l) => l !== 'en' && l !== 'pt')) {
      const res = await ai.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-opus-5-5',
        max_tokens: 8000,
        system: translatePrompt(locale),
        messages: [{ role: 'user', content: VSL_SCRIPTS_EN[persona] }],
      });
      const text = res.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('').trim();
      const file = join(SCRIPT_DIR, `${persona}.${locale}.txt`);
      writeFileSync(file, `${text}\n`);
      console.log(`✓ wrote ${file} — review it before generating`);
    }
  }
}

async function main() {
  if (args.has('translate')) return translateAll();

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  for (const persona of personas) {
    for (const locale of locales) {
      const script = scriptFor(persona, locale);
      if (!script) {
        console.warn(`- ${persona}/${locale}: no script (run with --translate first)`);
        continue;
      }
      const { data: cached } = await supabase
        .from('vsl_cache')
        .select('status')
        .eq('persona', persona)
        .eq('locale', locale)
        .maybeSingle();
      if (cached?.status === 'completed' && !args.has('force')) {
        console.log(`- ${persona}/${locale}: already done`);
        continue;
      }
      if (args.has('dry-run')) {
        console.log(`would generate ${persona}/${locale} (${script.split(/\s+/).length} words)`);
        continue;
      }

      const videoId = await generateVSL(persona, script, locale);
      await supabase.from('vsl_cache').upsert(
        { persona, locale, heygen_video_id: videoId, status: 'processing', updated_at: new Date().toISOString() },
        { onConflict: 'persona,locale' },
      );
      console.log(`… ${persona}/${locale}: rendering (${videoId})`);

      const deadline = Date.now() + 45 * 60_000;
      let status = await getVideoStatus(videoId);
      while (status.status !== 'completed' && status.status !== 'failed' && Date.now() < deadline) {
        await sleep(20_000);
        status = await getVideoStatus(videoId);
      }
      if (status.status !== 'completed' || !status.video_url) {
        await supabase.from('vsl_cache').update({ status: 'failed' }).eq('persona', persona).eq('locale', locale);
        console.error(`✗ ${persona}/${locale}: ${status.status} ${JSON.stringify(status.error ?? '')}`);
        continue;
      }

      // HeyGen URLs expire — copy the file to Supabase Storage.
      const video = await fetch(status.video_url);
      const path = `${persona}-${locale}.mp4`;
      const { error: uploadError } = await supabase.storage
        .from('vsl')
        .upload(path, Buffer.from(await video.arrayBuffer()), { contentType: 'video/mp4', upsert: true });
      if (uploadError) throw uploadError;
      const publicUrl = supabase.storage.from('vsl').getPublicUrl(path).data.publicUrl;
      await supabase
        .from('vsl_cache')
        .update({ status: 'completed', video_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('persona', persona)
        .eq('locale', locale);
      console.log(`✓ ${persona}/${locale}: ${publicUrl}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
