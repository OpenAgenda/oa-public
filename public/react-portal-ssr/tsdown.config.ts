import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['src/**/*.js'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  dts: false,
  loader: {
    '.js': 'jsx',
  },
});

export default config;
