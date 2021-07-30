const webpack = require('webpack');

module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  webpackFinal: async config => {
    config.plugins.push(
      new webpack.DefinePlugin({
        __CLIENT__: true,
        __SERVER__: false,
        __DEVELOPMENT__: true
      })
    );

    config.optimization.splitChunks.chunks = 'initial';

    return config;
  },
  core: {
    builder: 'webpack5',
  }
};
