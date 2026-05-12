import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/**/*.{ts,tsx,mjs}', '!src/types/modules.d.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  copy: [
    {
      from: 'src/locales/compiled/*.json',
      to: 'dist/locales/compiled',
      flatten: true,
    },
  ],
});
