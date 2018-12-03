"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const webpack = require( 'webpack' );

module.exports = {
  mode: 'development',
  context: __dirname,
  // in dev environment, entries are files in dev apps path
  entry: fs.readdirSync( __dirname + '/dev/client' ).reduce( ( entry, file ) => {

    if ( file.split( '.' ).pop() !== 'js' ) return entry; // only js files are interesting

    return _.set( entry, file.split( '.' ).shift(), [
      'webpack-hot-middleware/client',
      __dirname + '/dev/client/' + file
    ] );

  }, {} ),
  output: {
    filename: '[name].js',
    publicPath: '/js/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  module: {
    rules: [ {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    } ]
  },
  resolve: {
    symlinks: false
  }
};
