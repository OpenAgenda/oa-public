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
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/preset-scss'),
  ],
};
