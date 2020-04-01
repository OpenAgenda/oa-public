'use strict';

const fs = require('fs');
const webpack = require('webpack');
const PnpWebpackPlugin = require('pnp-webpack-plugin');

const jsEntryFiles = fs
  .readdirSync(`${__dirname}/../client`)
  .filter(filesAndFolders => filesAndFolders.split('.').length > 1);

module.exports = {
  mode: 'development',
  // context: __dirname,
  entry: jsEntryFiles.reduce(
    (entries, filename) => ({
      ...entries,
      [filename.split('.').shift()]: [
        'webpack-hot-middleware/client',
        `./client/${filename}`
      ]
    }),
    {}
  ),
  output: {
    publicPath: '/js/',
    filename: '[name].js'
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader')
        }
      }
    ]
  },
  resolve: {
    symlinks: false,
    plugins: [PnpWebpackPlugin]
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)]
  }
};
