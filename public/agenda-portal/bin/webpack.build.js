'use strict';

const fs = require('fs');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const PnpWebpackPlugin = require('pnp-webpack-plugin');

const jsEntryFiles = fs
  .readdirSync(`${__dirname}/../client`)
  .filter(filesAndFolders => filesAndFolders.split('.').length > 1);

module.exports = {
  mode: 'production',
  context: `${__dirname}/../`,
  optimization: { minimize: true },
  entry: jsEntryFiles.reduce(
    (entries, filename) => ({
      ...entries,
      [filename.split('.').shift()]: [`./client/${filename}`]
    }),
    {}
  ),
  output: {
    path: `${__dirname}/../assets/js`,
    filename: '[name].js'
  },
  plugins: [
    new LodashModuleReplacementPlugin({ paths: true }),
    new CleanWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: new RegExp('node_modules/(?!(@openagenda/agenda-portal))'),
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
