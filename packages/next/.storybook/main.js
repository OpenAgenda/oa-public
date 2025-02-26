import { dirname, join } from 'node:path';

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

const main = {
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },

  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  core: {
    builder: getAbsolutePath('@storybook/builder-webpack5'),
  },

  staticDirs: ['./public', '../stories/static'],

  babel: async (config) => {
    config.generatorOpts = { importAttributesKeyword: 'with' };
    return config;
  },
};

export default main;
