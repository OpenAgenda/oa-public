import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src'],
  target: 'es2022',
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
