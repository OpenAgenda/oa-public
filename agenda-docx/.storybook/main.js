import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function getAbsolutePath(pkg) {
  return dirname(fileURLToPath(import.meta.resolve(`${pkg}/package.json`)));
}

export default {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },

  babel: (config) => {
    return { ...config, rootMode: 'upward' };
  },

  addons: [getAbsolutePath('@storybook/addon-webpack5-compiler-babel')],
};
