import { dirname, join } from 'node:path';
import babelConfig from '../.babelrc';

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

export default {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },
  staticDirs: ['./public'],
  babel: (config) => ({ ...config, ...babelConfig }),
};
