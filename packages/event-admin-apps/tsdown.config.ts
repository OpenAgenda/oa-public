import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['src/**/*.{js,jsx,mjs}'],
  format: ['esm'],
  sourcemap: true,
  dts: false,
  loader: {
    '.js': 'jsx',
  },
  inputOptions: {
    transform: {
      jsx: {
        runtime: 'automatic',
      },
    },
  },
  copy: [
    {
      from: 'src/locales-compiled/*.json',
      to: 'dist/locales-compiled',
      flatten: true,
    },
  ],
});

export default config;
