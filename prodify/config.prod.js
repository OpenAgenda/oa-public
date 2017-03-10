"use strict";

const path = require( 'path' ),

  webpack = require( 'webpack' ),

  strip = require( 'strip-loader' ),

  ourOwnModules = require( './ourOwnModules.json' );


module.exports = paths => {

  return {
    //devtool: 'source-map',
    entry: path.join( __dirname, paths.src.path, paths.src.name ),
    output: {
      path: paths.dest.path,
      filename: paths.dest.name
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: [ 'babel' ],
          exclude: new RegExp( 'node_modules\\/(?!' + ourOwnModules.join( '|' ) + ')' )
        },
        {
          test: /\.json$/,
          loader: 'json'
        },
        {
          test: /\.ejs$/,
          loader: 'ejs-compiled'
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
      fallback: path.join( path.dirname(__dirname), 'node_modules' ),
      alias: {
        react: path.join( path.dirname(__dirname), 'node_modules/react' ),
        'react-dom': path.join( path.dirname(__dirname), 'node_modules/react-dom' )
      }
    },
    plugins: [
      new webpack.IgnorePlugin( /unicode\/category\/So/ ),
      new webpack.DefinePlugin( {
        'process.env': {
          NODE_ENV: '"production"'
        }
      } ),
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
