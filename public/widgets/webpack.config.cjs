'use strict';

const path = require('node:path');
const TerserPlugin = require('terser-webpack-plugin');

const mode = process.env.NODE_ENV || 'production';

const config = {
  mode,
  entry: './src/index.js',
  output: {
    publicPath: 'auto',
    path: path.resolve(__dirname, 'dist'),
    filename: 'widgets.js',
    chunkFilename: 'widgets-[chunkhash].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: require.resolve('babel-loader'),
        options: { rootMode: 'upward' },
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};

module.exports = config;
