import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
};

export default main;
