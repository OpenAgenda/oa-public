"use strict";

const webpack = require( 'webpack' );
const WebpackAssetsManifest = require('webpack-assets-manifest');
const ProgressBar = require( 'webpackbar' );
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
const LoadablePlugin = require( '@loadable/webpack-plugin' );
const getCacheDir = require( './getCacheDir' );
const BABEL_EXCLUDE_REGEX = require( './babelExcludeRegex' );


module.exports = ( { entry, output } ) => ({
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    ...entry,
    // webapp: path.join( path.dirname( __dirname ), 'webapp/index.js' )
  },
  output: {
    ...output,
    publicPath: '/js/',
    filename: '[name].js',
    chunkFilename: '[name].chunk.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx)$/,
        enforce: 'pre',
        loader: require.resolve('source-map-loader'),
        resolve: {
          fullySpecified: false
        },
      },
      {
        test: /\.(js|mjs|jsx)$/,
        loader: 'babel-loader',
        exclude: BABEL_EXCLUDE_REGEX,
        options: {
          cacheDirectory: process.env.DISABLE_WEBPACK_CACHE ? false : getCacheDir( 'babel-loader-dev' ),
          rootMode: 'upward'
        }
      },
      {
        test: /\.ejs$/,
        loader: 'ejs-compiled-loader-webpack4'
      },
      {
        test: /\.(css|html|tblr)$/,
        loader: 'raw-loader'
      }
    ]
  },
  resolve: {
    // symlinks: false,
    extensions: ['.js', '.jsx', '.mjs', '.json'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer')
    }
  },
  performance: {
    hints: false,
    maxAssetSize: Infinity
  },
  optimization: {
    moduleIds: 'named'
  },
  plugins: [
    new WebpackAssetsManifest({
      publicPath: true,
      integrity: true,
      integrityHashes: ['sha256'],
    }),
    new ProgressBar({ basic: false }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*.chunk.js']
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({ NODE_ENV: 'development' }),
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true,
      __DEVTOOLS__: true
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new LoadablePlugin()
  ]
});
