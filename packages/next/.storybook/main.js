import { dirname, join } from 'node:path';

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

export default {
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },

  stories: [
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  core: {
    builder: getAbsolutePath('@storybook/builder-webpack5'),
  },

  staticDirs: ['public'],

  env: config => ({
    ...config,
    __NEXT_REACT_ROOT: 'true', // Fix next/dynamic with suspense
  }),
};
