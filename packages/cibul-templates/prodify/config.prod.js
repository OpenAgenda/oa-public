"use strict";

const webpack = require( 'webpack' );
const WebpackAssetsManifest = require('webpack-assets-manifest');
const ProgressBar = require( 'webpackbar' );
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const LoadablePlugin = require( '@loadable/webpack-plugin' );
const getCacheDir = require( './getCacheDir' );
const BABEL_EXCLUDE_REGEX = require( './babelExcludeRegex' );


module.exports = ( { entry, output } ) => ({
  mode: 'production',
  entry: {
    ...entry,
    // webapp: path.join( path.dirname( __dirname ), 'webapp/index.js' )
  },
  output: {
    ...output,
    publicPath: '/js/',
    filename: mod => (mod.chunk.name === 'webapp'
      ? '[name].[contenthash:8].js'
      : '[name].js'),
    chunkFilename: '[id].[contenthash:8].chunk.js'
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
        test: /\.(js|mjs|jsx)?$/,
        loader: 'babel-loader',
        exclude: BABEL_EXCLUDE_REGEX,
        options: {
          cacheDirectory: process.env.DISABLE_WEBPACK_CACHE ? false : getCacheDir( 'babel-loader-dev' ),
          rootMode: 'upward'
        }
      },
      {
        test: /\.ejs$/,
        loader: 'ejs-compiled-loader-webpack4',
      },
      {
        test: /\.(css|html|tblr)$/,
        loader: 'raw-loader',
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
    maxAssetSize: 2000000
  },
  optimization: {
    moduleIds: 'deterministic',
    // minimize: false,
    minimizer: [
      new TerserPlugin( {
        cache: process.env.DISABLE_WEBPACK_CACHE ? false : getCacheDir( 'terser-webpack-plugin' ),
        extractComments: false,
        // parallel: true
      } )
    ]
  },
  plugins: [
    // new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
    new WebpackAssetsManifest({
      publicPath: true,
      integrity: true,
      integrityHashes: ['sha256'],
    }),
    new ProgressBar( { basic: false } ),
    new CleanWebpackPlugin( {
      cleanOnceBeforeBuildPatterns: [ '**/*.chunk.js', '**/webapp*.js' ]
    } ),
    new webpack.DefinePlugin( {
      'process.env': JSON.stringify({ NODE_ENV: 'production' }),
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false
    } ),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new LoadablePlugin()
  ]
});
