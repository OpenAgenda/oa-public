const webpack = require('webpack');

module.exports = {
  stories: [
    '../stories/**/*.stories.@(tsx|ts|jsx|js)',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  addons: [],
  webpackFinal(config) {
    config.plugins.push(new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }));

    return config;
  },
};
