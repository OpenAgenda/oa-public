import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['src/**/*.{js,jsx,mjs}'],
  outDir: 'build',
  format: ['esm'],
  sourcemap: true,
  dts: false,
  loader: {
    '.js': 'jsx',
  },
  copy: [
    {
      from: 'src/locales-compiled/*.json',
      to: 'build/locales-compiled',
      flatten: true,
    },
  ],
});

export default config;
