"use strict";

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: './client/src/index.js',
  output: {
    filename: 'index.js',
    path: __dirname + '/client/dist'
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
};
