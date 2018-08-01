"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const webpack = require( 'webpack' );

const devAppsPath = __dirname + '/client/src/dev';

module.exports = {
  mode: 'development',
  context: __dirname,
  // in dev environment, entries are files in dev apps path
  entry: fs.readdirSync( devAppsPath ).reduce( ( entry, file ) => {

    return _.set( entry, file.split( '.' ).shift(), [
      'webpack-hot-middleware/client',
      devAppsPath + '/' + file
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
        loader: 'babel-loader',
        options: {
          babelrc: true
        }
      }
    } ]
  },
  resolve: {
    symlinks: false
  }
};
