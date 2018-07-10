"use strict";

const webpack = require( 'webpack' );

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: [
    'webpack-hot-middleware/client',
    './client/src/dev.js'
  ],
  output: {
    filename: 'app.js',
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
