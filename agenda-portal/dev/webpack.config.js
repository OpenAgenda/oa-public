import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';

const jsEntryFiles = fs
  .readdirSync(`${import.meta.dirname}/../client`)
  .filter((filesAndFolders) => filesAndFolders.split('.').length > 1);

export default {
  mode: 'development',
  // context: __dirname,
  // See bin/webpack.server.js for why the built-in TypeScript support is pinned off.
  experiments: { typescript: false },
  entry: jsEntryFiles.reduce(
    (entries, filename) => ({
      ...entries,
      [filename.split('.').shift()]: [
        'webpack-hot-middleware/client',
        `./client/${filename}`,
      ],
    }),
    {},
  ),
  output: {
    publicPath: '/js/',
    filename: '[name].js',
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: fileURLToPath(import.meta.resolve('babel-loader')),
        },
      },
    ],
  },
};
