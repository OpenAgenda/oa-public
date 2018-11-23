"use strict";

const webpack = require( 'webpack' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const ProgressBar = require( 'webpackbar' );
const getCacheDir = require( './getCacheDir' );


module.exports = ( { entry, output } ) => ( {
  mode: 'production',
  entry,
  output,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          cacheDirectory: process.env.DISABLE_WEBPACK_CACHE ? false : getCacheDir( 'babel-loader-prod' )
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
    symlinks: false,
    extensions: [ '.js', '.jsx', '.json' ],
    alias: {
      'react': require.resolve( 'react' ),
    }
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
    new ProgressBar( { minimal: false } ),
    new webpack.DefinePlugin( {
      'process.env.NODE_ENV': '"production"',
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false
    } ),
  ],
  node: {
    fs: 'empty'
  }
} );
