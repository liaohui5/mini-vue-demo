import { defineConfig } from 'vite';
import path from 'path';

const resolvePath = (...args: string[]) => path.resolve(__dirname, ...args);

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: './dist',
    lib: {
      entry: resolvePath('./packages/vue/src/index.ts'),
      name: 'MiniVue',
      formats: ['es', 'cjs', 'umd', 'iife'],
      fileName: (format) => `mini-vue.${format}.js`,
    },
  },

  resolve: {
    // pnpm monorepo 路径问题解决
    alias: [
      {
        find: /@mini-vue\/(.+)/i,
        replacement: resolvePath('packages', '$1/src'),
      },
      {
        // for examples
        find: /^mini-vue$/i,
        replacement: resolvePath('./dist/mini-vue.es.js'),

        // 如果使用上面打包后的不好修改可以直接使用源码(vite 默认是支持 ts 的)
        // replacement: resolvePath('./packages/vue/src/index.ts'),
      },
    ],
  },
});
