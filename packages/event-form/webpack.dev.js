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
    publicPath: '/js/',
    filename: 'app.js'
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
          presets: [
            'babel-preset-env',
            'babel-preset-react',
            'babel-preset-es2015',
            'babel-preset-stage-0'
          ]
        }
      }
    } ]
  },
  resolve: {
    symlinks: false
  }
};