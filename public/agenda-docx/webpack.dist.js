'use strict';

const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const PnpWebpackPlugin = require('pnp-webpack-plugin');

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    './client/src/index.js',
  ],
  output: {
    filename: 'app.js',
    path: `${__dirname}/client/dist`,
  },
  plugins: [new LodashModuleReplacementPlugin()],
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
