import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
  entry: ['src/**/*.{js,jsx,mjs}'],
  outDir: 'build',
  format: ['esm', 'cjs'],
  sourcemap: true,
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
      to: 'build/locales-compiled',
      flatten: true,
    },
  ],
});

export default config;
