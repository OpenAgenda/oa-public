'use strict';

const fs = require('node:fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const mode = process.env.NODE_ENV || 'production';

const jsEntryFiles = fs
  .readdirSync(`${__dirname}/../client`)
  .filter((filesAndFolders) => filesAndFolders.split('.').length > 1);

module.exports = {
  mode,
  context: `${__dirname}/../`,
  optimization: { minimize: true },
  entry: jsEntryFiles.reduce(
    (entries, filename) => ({
      ...entries,
      [filename.split('.').shift()]: [`./client/${filename}`],
    }),
    {},
  ),
  output: {
    path: `${__dirname}/../assets/js`,
    filename: '[name].js',
  },
  plugins: [new CleanWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude:
          /node_modules\/(?!(@openagenda\/agenda-portal|@openagenda\/react-filters|@openagenda\/react-portal-ssr))/,
        loader: require.resolve('babel-loader'),
      },
    ],
  },
  resolve: {
    symlinks: false,
    alias: {
      '@httptoolkit/esm': false,
    },
  },
};
