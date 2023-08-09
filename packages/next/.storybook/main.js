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

    // Fix next/dynamic with suspense
    config.plugins.push(new webpack.DefinePlugin({
      'process.env.__NEXT_REACT_ROOT': 'true',
    }));

    return config;
  },
};
