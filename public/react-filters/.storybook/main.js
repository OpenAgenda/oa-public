import { dirname, join, resolve } from 'node:path';
import * as sass from 'sass';

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

export default {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },
  staticDirs: ['../dist'],
  addons: [getAbsolutePath('@storybook/addon-essentials')],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: require.resolve('sass-loader'),
          options: {
            implementation: sass,
          },
        },
      ],
      include: resolve(__dirname, '..'),
    });
    config.module.rules.push({
      test: /\.ejs$/,
      use: ['raw-loader'],
      include: resolve(__dirname, '../stories'),
    });
    return config;
  },
};
