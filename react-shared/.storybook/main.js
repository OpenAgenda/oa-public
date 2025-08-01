import { dirname, join } from 'node:path';

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

export default {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },
  addons: [
    getAbsolutePath('@storybook/preset-scss'),
    getAbsolutePath('@storybook/addon-webpack5-compiler-babel'),
  ],
  staticDirs: ['./public'],
  babel: (config) => {
    return { ...config, rootMode: 'upward' };
  },
};
