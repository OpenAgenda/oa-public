import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;
const loadedEnv = loadEnvConfig(process.cwd());

function getAbsolutePath(pkg) {
  return dirname(fileURLToPath(import.meta.resolve(`${pkg}/package.json`)));
}

const main = {
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {
      nextConfigPath: join(import.meta.dirname, '../next.config.mjs'),
    },
  },

  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  core: {
    builder: import.meta.resolve('@storybook/builder-webpack5'),
  },

  staticDirs: ['../public', './public', '../stories/static'],

  addons: [getAbsolutePath('@storybook/addon-a11y')],

  webpackFinal: async (config) => {
    // https://github.com/vidstack/player/pull/1655
    if (config.module && config.module.rules) {
      config.module.rules.push({
        test: /\.css$/,
        include: getAbsolutePath('@vidstack/react'),
        sideEffects: true,
      });
    }

    return config;
  },

  // Storybook inlines `env` into the client preview bundle, so only NEXT_PUBLIC_*
  // may cross over (the stories need them for image/CDN URLs). Spreading the full
  // parsed env would bake server-only secrets (e.g. NEXT_STRAPI_API_AUTH_TOKEN)
  // into browser-facing JS.
  env: (baseEnv) => ({
    ...baseEnv,
    ...Object.fromEntries(
      Object.entries(loadedEnv.parsedEnv ?? {}).filter(([key]) =>
        key.startsWith('NEXT_PUBLIC_'),
      ),
    ),
  }),
};

export default main;
