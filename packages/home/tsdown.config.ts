import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['src/**/*.{js,jsx,mjs}'],
  format: ['esm'],
  platform: 'neutral',
  sourcemap: true,
  dts: false,
  loader: {
    '.js': 'jsx',
  },
});

export default config;
