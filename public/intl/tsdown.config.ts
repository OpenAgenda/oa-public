import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['src/**/*.{js,jsx,mjs}'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  dts: false,
});

export default config;
