/**
 * Builds a single self-contained HTML page of the funnel (demo mode) for sharing a preview link.
 *   node demo/build.mjs            → demo/dist/index.html
 * Uses the project's Tailwind config and the real components; next/* modules are shimmed.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = resolve(here, '..');
const out = join(here, 'dist');
mkdirSync(out, { recursive: true });

// esbuild: from the project if installed, otherwise from ESBUILD_PATH (a scratch install).
const require = createRequire(import.meta.url);
const esbuild = require(process.env.ESBUILD_PATH ?? 'esbuild');

const shim = (name) => join(here, 'shims', name);
const SHIMS = {
  'next/navigation': shim('navigation.ts'),
  'next/link': shim('link.tsx'),
  'next/image': shim('image.tsx'),
  'next/script': shim('script.tsx'),
  'next/headers': shim('headers.ts'),
  '@/lib/browser': shim('browser.ts'),
};

const shimPlugin = {
  name: 'next-shims',
  setup(build) {
    const filter = new RegExp(`^(${Object.keys(SHIMS).map((k) => k.replace(/[/@]/g, '\\$&')).join('|')})$`);
    build.onResolve({ filter }, (args) => ({ path: SHIMS[args.path] }));
  },
};

const result = await esbuild.build({
  entryPoints: [join(here, 'main.tsx')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020', 'safari15'],
  jsx: 'automatic',
  write: false,
  logLevel: 'warning',
  logOverride: { 'unsupported-directive': 'silent' },
  tsconfig: join(site, 'tsconfig.json'),
  plugins: [shimPlugin],
  define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

const cssFile = join(out, 'tailwind.css');
execFileSync(
  join(site, 'node_modules/.bin/tailwindcss'),
  ['-c', join(site, 'tailwind.config.ts'), '-i', join(site, 'app/globals.css'), '-o', cssFile, '--minify', '--content', `${site}/{app,components,demo}/**/*.{ts,tsx}`],
  { stdio: 'inherit' },
);
const css = readFileSync(cssFile, 'utf8');

const html = `<title>Funil VitalRise</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Playfair+Display:wght@400;600&display=swap">
<style>
:root{--font-display:'Playfair Display',Georgia,'Times New Roman',serif;--font-body:Inter,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;--font-mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace}
${css}
</style>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync(join(out, 'index.html'), html);
console.log(`demo/dist/index.html — ${(html.length / 1024).toFixed(0)} KB`);
