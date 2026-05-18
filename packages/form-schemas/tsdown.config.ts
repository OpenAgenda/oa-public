import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['client/src/**/*.{js,jsx,mjs}'],
  outDir: 'client/build',
  format: ['esm'],
  sourcemap: true,
  dts: false,
  loader: {
    '.js': 'jsx',
  },
});

export default config;
