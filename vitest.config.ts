import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['**/__test__/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },

  resolve: {
    // pnpm monorepo 路径问题解决
    alias: [
      {
        find: /@mini-vue\/(.+)/i,
        replacement: path.resolve(__dirname, 'packages', '$1/src'),
      },
    ],
  },
});
