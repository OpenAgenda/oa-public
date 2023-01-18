'use strict';

const path = require('path');
const sass = require('sass');

module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials'],
  webpackFinal: async config => {
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: require.resolve('sass-loader'),
          options: {
            implementation: sass
          }
        }
      ],
      include: path.resolve(__dirname, '..'),
    });
    config.module.rules.push({
      test: /\.ejs$/,
      use: ['raw-loader'],
      include: path.resolve(__dirname, '../stories'),
    });
    return config;
  },
  core: {
    builder: 'webpack5'
  },
  reactOptions: {
    fastRefresh: true,
    // strictMode: true,
  },
};
