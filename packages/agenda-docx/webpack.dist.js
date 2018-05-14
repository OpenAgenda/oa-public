"use strict";

const webpack = require( 'webpack' );
const LodashModuleReplacementPlugin = require( 'lodash-webpack-plugin' );

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: [
    'babel-polyfill', // for async await
    './client/src/index.js'
  ],
  output: {
    filename: 'app.js',
    path: __dirname + '/client/dist'
  },
  plugins: [
    new LodashModuleReplacementPlugin
  ],
  module: {
    rules: [ {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: [
            'lodash'
          ],
          presets: [
            'babel-preset-env',
            'babel-preset-react',
            'babel-preset-es2015',
            'babel-preset-stage-0'
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
};
