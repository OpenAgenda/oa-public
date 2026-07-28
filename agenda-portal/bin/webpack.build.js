import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const mode = process.env.NODE_ENV || 'production';

const jsEntryFiles = fs
  .readdirSync(`${import.meta.dirname}/../client`)
  .filter((filesAndFolders) => filesAndFolders.split('.').length > 1);

export default {
  mode,
  context: `${import.meta.dirname}/../`,
  // See bin/webpack.server.js for why the built-in TypeScript support is pinned off.
  experiments: { typescript: false },
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
    clean: true,
  },
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
};
