import { resolve } from 'node:path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';

const r = (p: string) => resolve(__dirname, p);

// Pacotes internos (packages/*) são código-fonte TypeScript e entram no bundle.
// Dependências de node_modules usadas pelo processo principal ficam externas e
// são empacotadas pelo electron-builder.
const alias = {
  '@advertex/shared': r('packages/shared/src'),
  '@advertex/core': r('packages/core/src'),
  '@advertex/ai-core': r('packages/ai-core/src'),
  '@advertex/advertising-core': r('packages/advertising-core/src'),
  '@advertex/platform-meta': r('packages/platform-meta/src'),
  '@advertex/platform-google': r('packages/platform-google/src'),
};

/**
 * Content-Security-Policy por modo. Produção: somente recursos locais, sem
 * scripts inline. Desenvolvimento: libera o preâmbulo do React Refresh e o HMR.
 */
function csp(): Plugin {
  const prod = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    // Miniaturas dos anúncios da Meta (Cérebro criativo) vêm do CDN da Meta.
    "img-src 'self' data: blob: advertex-asset: https://*.fbcdn.net",
    "media-src 'self' advertex-asset:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
  const dev = prod.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'").replace("connect-src 'self'", "connect-src 'self' ws://localhost:* http://localhost:*");
  return {
    name: 'advertex-csp',
    transformIndexHtml: (html, ctx) => html.replace('%ADVERTEX_CSP%', ctx.server ? dev : prod),
  };
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: {
      outDir: 'out/main',
      rollupOptions: { input: { index: r('apps/desktop/src/main/index.ts') } },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: { index: r('apps/desktop/src/preload/index.ts') },
        // Preload em sandbox precisa ser CommonJS.
        output: { format: 'cjs', entryFileNames: '[name].js' },
      },
    },
  },
  renderer: {
    root: r('apps/desktop/src/renderer'),
    plugins: [react(), tailwindcss(), csp()],
    resolve: {
      alias: { ...alias, '@renderer': r('apps/desktop/src/renderer/src') },
    },
    build: {
      outDir: r('out/renderer'),
      rollupOptions: { input: { index: r('apps/desktop/src/renderer/index.html') } },
    },
  },
});
