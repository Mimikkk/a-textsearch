import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'build',
    lib: {
      entry: 'src/a-textsearch.ts',
      name: 'a-textsearch',
      fileName: format => `a-textsearch.${format}.js`,
      formats: ['es', 'cjs', 'umd'],
    },
  },
});
