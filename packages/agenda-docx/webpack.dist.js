"use strict";

const LodashModuleReplacementPlugin = require( 'lodash-webpack-plugin' );

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: [
    //'babel-polyfill', // for async await ( cannot be used twice https://github.com/babel/babel-loader/issues/401 )
    './client/src/index.js'
  ],
  output: {
    filename: 'app.js',
    path: __dirname + '/client/dist'
  },
  plugins: [
    new LodashModuleReplacementPlugin()
  ],
  module: {
    rules: [ {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    } ]
  },
  resolve: {
    symlinks: false
  }
};
