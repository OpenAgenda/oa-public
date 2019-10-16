"use strict";

const webpack = require( 'webpack' );

const modulesToInclude = [
  '@feathersjs',
  'react-intl',
  'intl-messageformat',
  'intl-messageformat-parser'
];
const BABEL_EXCLUDE_REGEX = new RegExp(`node_modules\\/(?!(${modulesToInclude.join('|')}))`);

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: [
    'webpack-hot-middleware/client',
    './client/src/index.js'
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
      exclude: BABEL_EXCLUDE_REGEX,
      loader: 'babel-loader',
      options: {
        rootMode: 'upward'
      }
    } ]
  },
  resolve: {
    symlinks: false,
    alias: {
      // required only for the timings component
      'react': require.resolve( 'react' )
    }
  }
};
