"use strict";

const getCacheDir = require( './getCacheDir' );


module.exports = function getBabelRule( includePath, cwd = includePath, options ) {
  return ({
    test: /\.jsx?$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
    include: includePath,
    options: {
      cwd,
      cacheDirectory: process.env.DISABLE_WEBPACK_CACHE ? false : getCacheDir( 'babel-loader-dev' ),
      ...options
    }
  });
}
