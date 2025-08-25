import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';

const agendaPortalPath = path.dirname(
  fileURLToPath(import.meta.resolve('../package.json')),
);

const i18nEntryFile = process.env.PORTAL_I18N_PATH;

export default {
  mode: 'production',
  context: process.env.PORTAL_DIR,
  target: 'node',
  entry: path.resolve(process.env.PORTAL_DIR, 'server.js'),
  output: {
    path: path.resolve(process.env.PORTAL_DIR, 'dist'),
    filename: 'server.cjs',
    clean: true,
  },

  resolve: {
    alias: {
      handlebars: 'handlebars/dist/handlebars.js',
    },
  },

  plugins: [
    new webpack.DefinePlugin({
      'import.meta.dirname': '__dirname',
      'process.env.PORTAL_I18N_PATH': JSON.stringify(i18nEntryFile),
    }),

    new CopyPlugin({
      patterns: [
        {
          from: process.env.PORTAL_VIEWS_FOLDER,
          to: process.env.PORTAL_VIEWS_FOLDER,
        },
        {
          from: process.env.PORTAL_I18N_PATH,
          to: process.env.PORTAL_I18N_PATH,
        },
        {
          from: process.env.PORTAL_ASSETS_FOLDER,
          to: process.env.PORTAL_ASSETS_FOLDER,
          noErrorOnMissing: true,
        },
        {
          from: path.join(agendaPortalPath, 'assets'),
          to: 'assets',
        },
      ],
    }),

    new webpack.IgnorePlugin({
      resourceRegExp: /^(canvas|bufferutil|utf-8-validate)$/,
    }),
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
  optimization: {
    minimize: true,
  },
  devtool: false,
};
