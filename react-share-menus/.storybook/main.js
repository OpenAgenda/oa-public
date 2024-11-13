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
  babel: (config) => {
    return { ...config, rootMode: 'upward' };
  },
  webpackFinal: (config) => {
    config.resolve.alias['@httptoolkit/esm'] = false;
    return config;
  },
};
