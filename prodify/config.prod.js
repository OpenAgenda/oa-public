"use strict";

const path = require( 'path' ),

  webpack = require( 'webpack' ),

  strip = require( 'strip-loader' ),

  ourOwnModules = require( './ourOwnModules.json' );


module.exports = ( paths ) => {

  return {
    devtool: 'source-map',
    entry: path.join( __dirname, paths.src.path, paths.src.name ),
    output: {
      path: paths.dest.path,
      filename: paths.dest.name
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: [ strip.loader( 'debug', 'console.log' ), 'babel' ],
          exclude: new RegExp( 'node_modules\\/(?!' + ourOwnModules.join( '|' ) + ')' )
        },
        {
          test: /\.json$/,
          loader: 'json'
        },
        {
          test: /\.ejs$/,
          loader: 'ejs'
        },
        {
          test: /\.(css|html|tblr)$/,
          loader: 'raw'
        }
      ]
    },
    progress: true,
    resolve: {
      extensions: [ '', '.js', '.jsx' ],
      moduleDirectories: [ './node_modules' ],
      fallback: path.join( __dirname, '../node_modules' )
    },
    resolveLoader: { root: path.join( __dirname, '../node_modules' ) },
    plugins: [
      new webpack.DefinePlugin( {
        'process.env': {
          NODE_ENV: '"production"'
        },
        __CLIENT__: true,
        __SERVER__: false,
        __DEVELOPMENT__: false,
        __DEVTOOLS__: false
      } ),
      new webpack.IgnorePlugin( /(.*)/, /node_modules\/(imagesloaded|get-size|outlayer|fizzy-ui-utils)/ ),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
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