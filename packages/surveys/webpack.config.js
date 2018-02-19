"use strict";

const webpack = require( 'webpack' );

module.exports = {
  context: __dirname,
  entry: [ 
    'webpack-hot-middleware/client',
    './client/src/index.js'
  ],
  output: {
    filename: 'index.js',
    path: __dirname,
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
          presets: [
            'babel-preset-env',
            'babel-preset-react'
          ]
        }
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
}
