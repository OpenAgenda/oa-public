'use strict';

const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    './client/src/index.js'
  ],
  output: {
    filename: 'app.js',
    path: `${__dirname}/client/dist`
  },
  plugins: [new LodashModuleReplacementPlugin()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  resolve: {
    symlinks: false
  }
};
