"use strict";

const webpack = require( 'webpack' );

module.exports = {
  context: __dirname,
  entry: './client/index.js',
  output: {
    filename: 'index.js',
    path: __dirname + '/assets'
  },
  module: {
    rules: [ {
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            'babel-preset-es2015',
            'babel-preset-env',
            'babel-preset-react',
            [ 'babel-preset-minify', {
              evaluate: true,
              mangle: false
            } ]
          ],
          plugins: [
            require( 'babel-plugin-lodash' ),
            require( 'babel-plugin-transform-object-rest-spread' ),
            require( 'babel-plugin-transform-es3-member-expression-literals' ),
            require( 'babel-plugin-transform-es3-property-literals' )
          ]
        }
      }
    } ]
  },
  resolve: {
    symlinks: false
  }
}