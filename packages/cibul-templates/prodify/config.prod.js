"use strict";

const path = require( 'path' );
const webpack = require( 'webpack' );
const ourOwnModules = require( './ourOwnModules.json' );

module.exports = paths => {

  return {
    entry: path.join( __dirname, paths.src.path, paths.src.name ),
    output: {
      path: paths.dest.path,
      filename: paths.dest.name
    },
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
              cacheDirectory: true,
              forceEnv: 'production'
            }
          }
        },
        {
          test: /\.ejs$/,
          loader: 'ejs-compiled-loader',
        },
        {
          test: /\.(css|html|tblr)$/,
          loader: 'raw-loader',
        }
      ]
    },
    resolve: {
      symlinks: false,
      extensions: [ '.js', '.jsx' ],
      alias: {
        'react': require.resolve( 'react' ),
      }
    },
    performance: {
      hints: false,
      maxAssetSize: 2000000
    },
    plugins: [
      new webpack.IgnorePlugin( /unicode\/category\/So/ ),
      new webpack.DefinePlugin( {
        'process.env': {
          NODE_ENV: '"production"'
        },
        __CLIENT__: true,
        __SERVER__: false,
        __DEVELOPMENT__: false,
        __DEVTOOLS__: false
      } ),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin( {
        compress: {
          warnings: false
        },
        mangle: true,
        fromString: true
      } )
    ],
    node: {
      fs: 'empty'
    }
  };

};
