"use strict";

const webpack = require( 'webpack' );
const ProgressBar = require( 'webpackbar' );
const getCacheDir = require( './getCacheDir' );
const ourOwnModules = require( './ourOwnModules.json' );


module.exports = ( { entry, output } ) => {

  return {
    mode: 'development',
    devtool: 'eval-source-map',
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
              cacheDirectory: getCacheDir( 'babel-loader' ),
              forceEnv: 'development'
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
      maxAssetSize: 20000000
    },
    plugins: [
      new ProgressBar(),
      new webpack.DefinePlugin( {
        'process.env.NODE_ENV': '"development"',
        __CLIENT__: true,
        __SERVER__: false,
        __DEVELOPMENT__: true,
        __DEVTOOLS__: true
      } )
    ],
    node: {
      fs: 'empty'
    }
  };

};
