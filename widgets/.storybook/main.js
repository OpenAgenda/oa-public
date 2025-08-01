import { dirname, join } from 'node:path';

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

/** @type { import('@storybook/html-webpack5').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: ['../dist'],
  framework: {
    name: getAbsolutePath('@storybook/html-vite'),
    options: {},
  },
  addons: [],
};
export default config;
