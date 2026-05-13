import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['src/**/*.ts'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  dts: true,
});

export default config;
