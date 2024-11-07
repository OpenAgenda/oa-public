import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src'],
  format: 'esm',
  clean: true,
  sourcemap: true,
  loader: {
    '.js': 'jsx',
  },
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
