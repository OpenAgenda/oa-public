import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.js'],
  treeshake: true,
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
  terserOptions: {
    format: {
      comments: false,
    },
  },
  clean: true,
  splitting: false,
  external: [],
  noExternal: [
    '@iframe-resizer/parent',
  ],
});
