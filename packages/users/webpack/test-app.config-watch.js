"use strict";

const webpack = require( "webpack" ),

  config = require( "./test-app.config" );


config.cache = true;
config.debug = true;

config.plugins = [
  new webpack.DefinePlugin( { __CLIENT__: false, __SERVER__: true, __PRODUCTION__: false, __DEV__: true } ),
  new webpack.DefinePlugin( { 'process.env': { NODE_ENV: 'development' } } ),
  new webpack.NoErrorsPlugin()
];

module.exports = config;