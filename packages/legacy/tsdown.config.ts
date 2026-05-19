import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['embeds/app/src/**/*.{js,jsx,mjs}'],
  outDir: 'embeds/app/dist',
  format: ['esm'],
  platform: 'neutral',
  sourcemap: true,
  dts: false,
  loader: {
    '.js': 'jsx',
  },
  copy: [
    {
      from: 'embeds/app/src/locales-compiled/*.json',
      to: 'embeds/app/dist/locales-compiled',
      flatten: true,
    },
  ],
});

export default config;
