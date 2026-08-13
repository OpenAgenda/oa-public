import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['src/index.ts', 'src/images/index.ts'],
  format: ['esm'],
  sourcemap: true,
  dts: true,
});

export default config;
