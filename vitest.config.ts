import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const r = (p: string) => resolve(__dirname, p);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@advertex/shared': r('packages/shared/src'),
      '@advertex/core': r('packages/core/src'),
      '@advertex/ai-core': r('packages/ai-core/src'),
      '@advertex/advertising-core': r('packages/advertising-core/src'),
      '@advertex/platform-meta': r('packages/platform-meta/src'),
      '@advertex/platform-google': r('packages/platform-google/src'),
      '@renderer': r('apps/desktop/src/renderer/src'),
    },
  },
  test: {
    include: ['packages/**/*.test.ts', 'apps/**/*.test.ts', 'apps/**/*.test.tsx'],
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
  },
});
