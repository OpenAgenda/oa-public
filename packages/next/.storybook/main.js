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

    // webpack can't resolve the dynamic-import *context* base
    // (`import(\`@openagenda/activity-apps/locales-compiled/${locale}.json\`)`)
    // through the package `exports` field, so alias it to the built dir. The
    // package export is correct for node/Turbopack; this is a webpack-only gap.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@openagenda/activity-apps/locales-compiled': join(
        getAbsolutePath('@openagenda/activity-apps'),
        'dist/locales-compiled',
      ),
    };

    return config;
  },

  env: (baseEnv) => ({
    ...baseEnv,
    ...loadedEnv.parsedEnv,
  }),
};

export default main;
