'use strict';

const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { mkdirp } = require('mkdirp');
const webpack = require('webpack');
const ProgressBar = require('webpackbar');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const modulesToInclude = [
  '@feathersjs',
  '@openagenda',
  '@react-leaflet/core',
  'buffer',
  'debug',
  'intl-messageformat',
  'intl-messageformat-parser',
  'is-plain-obj',
  'lru-cache',
  'react-intl',
  'react-leaflet',
  'react-markdown',
  'yallist',
];
const BABEL_EXCLUDE_REGEX = new RegExp(
  `node_modules/(?!(${modulesToInclude.join('|')}))`,
);

const serviceName = require('./package.json').name.split('/').pop();

function getCacheDir(name) {
  const homeCacheDir = path.join(os.homedir(), '.cache');
  const persistentPath = path.join(homeCacheDir, serviceName, name);

  if (fs.existsSync(homeCacheDir)) {
    mkdirp.sync(persistentPath);

    return persistentPath;
  }

  return `node_modules/.cache/${name}`;
}

module.exports = (env = {}, argv = {}) => {
  const defaultEnvName = env.production || argv.mode === 'production' ? 'production' : 'development';
  const envName = process.env.NODE_ENV || env.NODE_ENV || defaultEnvName;
  const babelEnvName = process.env.BABEL_ENV || env.BABEL_ENV || envName;

  return {
    mode: envName === 'production' ? 'production' : 'development',
    entry: path.join(__dirname, 'src/main.js'),
    output: {
      path: path.join(__dirname, 'dist'),
      // publicPath: `/dist/${serviceName}/`,
      filename: '[name].js',
    },
    devtool:
      envName === 'production' ? 'source-map' : 'cheap-module-source-map',
    stats: {
      preset: 'minimal',
      colors: true,
      assets: false,
      modules: false,
      errorDetails: true,
      errorStack: true,
    },
    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx)$/,
          enforce: 'pre',
          loader: require.resolve('source-map-loader'),
          resolve: {
            fullySpecified: false,
          },
          exclude: [
            /\/node_modules\/nth-check\//,
            /\/node_modules\/@formatjs\//,
            /\/node_modules\/intl-messageformat\//,
          ],
        },
        {
          test: /\.(js|mjs|jsx)$/,
          loader: require.resolve('babel-loader'),
          exclude: [
            BABEL_EXCLUDE_REGEX,
            /\/node_modules\/@openagenda\/leaflet-gesture-handling\//,
          ],
          options: {
            cacheDirectory: process.env.DISABLE_WEBPACK_CACHE
              ? false
              : getCacheDir('babel-loader-dev'),
            envName: babelEnvName,
            rootMode: 'upward',
          },
        },
      ],
    },
    resolve: {
      // symlinks: false,
      extensions: ['.wasm', '.mjs', '.js', '.jsx', '.json'],
      fallback: {
        buffer: require.resolve('buffer'),
      },
      conditionNames: ['oa', '...'],
    },
    performance: {
      hints: false,
      maxAssetSize: envName === 'production' ? 2000000 : Infinity,
    },
    cache: {
      type: process.env.DISABLE_WEBPACK_CACHE ? 'memory' : 'filesystem',
    },
    optimization: {
      nodeEnv: envName,
      moduleIds: envName === 'production' ? 'deterministic' : 'named',
      minimize: envName === 'production',
      minimizer: [
        new TerserPlugin({
          terserOptions: { sourceMap: true },
        }),
      ],
    },
    plugins: [
      // new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
      // new WebpackDashboardPlugin(),
      new ProgressBar({ basic: false }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({ NODE_ENV: envName }),
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new CleanWebpackPlugin(),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
  };
};
