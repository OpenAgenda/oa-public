import { dirname, join } from 'node:path';

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

const main = {
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {
      nextConfigPath: join(__dirname, '../next.config.mjs'),
    },
  },

  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  core: {
    builder: getAbsolutePath('@storybook/builder-webpack5'),
  },

  staticDirs: ['../public', './public', '../stories/static'],

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
