const webpack = require('webpack');
const ImageConfig = require('next/dist/shared/lib/image-config');

module.exports = {
  stories: [
    '../stories/**/*.stories.@(tsx|ts|jsx|js|mts|mjs|cts)',
  ],
  addons: [
    'storybook-addon-next',
  ],
  core: {
    builder: 'webpack5',
  },
  webpackFinal(config) {
    config.module.rules.push({
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      resolve: {
        fullySpecified: false,
      },
    });

    config.plugins.push(new webpack.DefinePlugin({
      'process.env.__NEXT_IMAGE_OPTS': JSON.stringify({
        ...ImageConfig.imageConfigDefault,
        experimentalFuture: true,
      }),
    }));

    return config;
  },
};
