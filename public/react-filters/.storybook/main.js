import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

function getAbsolutePath(pkg) {
  return dirname(fileURLToPath(import.meta.resolve(`${pkg}/package.json`)));
}

export default {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },
  staticDirs: ['./public', '../dist'],
  addons: [getAbsolutePath('@storybook/addon-webpack5-compiler-babel')],
  babel: (config) => {
    return { ...config, rootMode: 'upward' };
  },
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            implementation: sass,
          },
        },
      ],
      include: resolve(import.meta.dirname, '..'),
    });
    config.module.rules.push({
      test: /\.ejs$/,
      use: ['raw-loader'],
      include: resolve(import.meta.dirname, '../stories'),
    });
    return config;
  },
};
