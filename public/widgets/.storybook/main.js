import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function getAbsolutePath(pkg) {
  return dirname(fileURLToPath(import.meta.resolve(`${pkg}/package.json`)));
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
