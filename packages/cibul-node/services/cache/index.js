"use strict";

var utils = require( '../../lib/utils' ),

functionCache = require( './lib/functionCache' ),

instanceCache = require( './lib/instanceCache' ),

lib = require( './lib/lib' );

module.exports = instanceCache;

utils.extend( module.exports, {
  init: lib.init, // load redis config
  func: functionCache,  // function caching
  setOnCache: lib.setOnCache, // set callback called when something has been cached
  unsetOnCache: lib.unsetOnCache // unset callback called when something has been removed from cache
});