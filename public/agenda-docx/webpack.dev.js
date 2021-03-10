'use strict';

const webpack = require('webpack');
const PnpWebpackPlugin = require('pnp-webpack-plugin');

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    'webpack-hot-middleware/client',
    './client/src/index.js',
  ],
  output: {
    filename: 'index.js',
    publicPath: '/js/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader'),
        },
      },
      {
        test: /\.css$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader')],
      },
      {
        test: /\.scss$/,
        use: [
          require.resolve('style-loader'),
          require.resolve('css-loader'),
          require.resolve('sass-loader'),
        ],
      },
    ],
  },
  resolve: {
    symlinks: false,
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
};
