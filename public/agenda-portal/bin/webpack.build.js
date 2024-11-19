import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

const mode = process.env.NODE_ENV || 'production';

const jsEntryFiles = fs
  .readdirSync(`${import.meta.dirname}/../client`)
  .filter((filesAndFolders) => filesAndFolders.split('.').length > 1);

export default {
  mode,
  context: `${import.meta.dirname}/../`,
  optimization: { minimize: true },
  entry: jsEntryFiles.reduce(
    (entries, filename) => ({
      ...entries,
      [filename.split('.').shift()]: [`./client/${filename}`],
    }),
    {},
  ),
  output: {
    path: `${import.meta.dirname}/../assets/js`,
    filename: '[name].js',
  },
  plugins: [new CleanWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude:
          /node_modules\/(?!(@openagenda\/agenda-portal|@openagenda\/react-filters|@openagenda\/react-portal-ssr))/,
        loader: fileURLToPath(import.meta.resolve('babel-loader')),
      },
    ],
  },
  resolve: {
    symlinks: false,
  },
};
