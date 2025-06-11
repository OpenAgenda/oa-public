import { dirname, join } from 'node:path';

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

export default {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: getAbsolutePath('@storybook/react-webpack5'),
  addons: [getAbsolutePath('@storybook/addon-webpack5-compiler-babel')],
  babel: (config) => {
    return { ...config, rootMode: 'upward' };
  },
};
