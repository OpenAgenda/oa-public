import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src'],
  outDir: 'build',
  format: ['esm', 'cjs'],
  clean: true,
  sourcemap: true,
  loader: {
    '.js': 'jsx',
    '.json': 'copy',
  },
  esbuildOptions(options) {
    options.jsx = 'automatic';
    options.jsxImportSource = '@emotion/react';
  },
});
