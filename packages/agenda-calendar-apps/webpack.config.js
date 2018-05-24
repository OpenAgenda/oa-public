"use strict";

const HTMLWebpackPlugin = require( 'html-webpack-plugin' );
const webpack = require( 'webpack' );

module.exports = {
  entry: __dirname + '/react/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index.js'
  },
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
  plugins: [
    new HTMLWebpackPlugin( {
      template: 'index.html' 
    } )
  ]
}