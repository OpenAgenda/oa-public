'use strict';

const fs = require('fs');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const jsEntryFiles = fs
  .readdirSync(`${__dirname}/../client`)
  .filter(filesAndFolders => filesAndFolders.split('.').length > 1);

module.exports = {
  mode: 'development',
  context: `${__dirname}/../`,
  optimization: { minimize: true },
  entry: jsEntryFiles.reduce(
    (entries, filename) => ({
      ...entries,
      [filename.split('.').shift()]: [`./client/${filename}`],
    }),
    {}
  ),
  output: {
    path: `${__dirname}/../assets/js`,
    filename: '[name].js',
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: new RegExp('node_modules/(?!(@openagenda/agenda-portal|@openagenda/react-filters))'),
        loader: require.resolve('babel-loader'),
      },
    ],
  },
  resolve: {
    symlinks: false,
  },
};
