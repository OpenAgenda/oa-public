"use strict";

const webpack = require( 'webpack' );

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: './client/index.js',
  output: {
    filename: 'index.js',
    path: __dirname + '/dist'
  },
  module: {
    rules: [ {
      test: /\.js$/,
      use: {
        loader: 'babel-loader'
      }
    } ]
  },
  resolve: {
    symlinks: false
  }
}