"use strict";


const webpack = require( 'webpack' );
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );
const ProgressBar = require( 'webpackbar' );
const getCacheDir = require( './getCacheDir' );
const ourOwnModules = require( './ourOwnModules.json' );

module.exports = ( { entry, output } ) => ( {
  mode: 'production',
  entry,
  output,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        enforce: 'pre',
        loader: 'source-map-loader'
      },
      {
        test: /\.jsx?$/,
        exclude: new RegExp( 'node_modules\\/(?!' + ourOwnModules.join( '|' ) + ')' ),
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: process.env.DISABLE_WEBPACK_CACHE ? false : getCacheDir( 'babel-loader-prod' ),
            forceEnv: 'production'
          }
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
      new UglifyJsPlugin( {
        cache: process.env.DISABLE_WEBPACK_CACHE ? false : getCacheDir( 'uglifyjs-webpack-plugin' ),
        // parallel: true,
        uglifyOptions: {
          compress: {
            collapse_vars: false
          },
          mangle: true,
          // fromString: true
        }
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
