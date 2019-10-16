"use strict";

const path = require( 'path' );
const webpack = require( 'webpack' );
const ManifestPlugin = require( 'webpack-manifest-plugin' );
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
        test: /\.jsx?$/,
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
    extensions: [ '.js', '.jsx', '.json' ]
  },
  performance: {
    hints: false,
    maxAssetSize: 2000000
  },
  optimization: {
    minimizer: [
      new TerserPlugin( {
        cache: process.env.DISABLE_WEBPACK_CACHE ? false : getCacheDir( 'terser-webpack-plugin' ),
        // parallel: true
      } )
    ]
  },
  plugins: [
    // new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
    new ManifestPlugin(),
    new ProgressBar( { minimal: false } ),
    new CleanWebpackPlugin( {
      cleanOnceBeforeBuildPatterns: [ '**/*.chunk.js', '**/webapp*.js' ]
    } ),
    new webpack.DefinePlugin( {
      'process.env.NODE_ENV': '"production"',
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false
    } ),
    new LoadablePlugin(),
    new webpack.HashedModuleIdsPlugin()
  ],
  node: {
    fs: 'empty'
  }
});
