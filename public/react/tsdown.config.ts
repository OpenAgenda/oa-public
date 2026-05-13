import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
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

export default config;
