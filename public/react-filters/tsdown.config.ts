import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['src/**/*.{js,jsx,mjs}'],
  outDir: 'build',
  format: ['esm', 'cjs'],
  sourcemap: true,
  loader: {
    '.js': 'jsx',
  },
  inputOptions: {
    transform: {
      jsx: {
        runtime: 'automatic',
        importSource: '@emotion/react',
      },
    },
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
