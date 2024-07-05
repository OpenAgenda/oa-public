'use strict';

const utils = require('../../lib/utils');

const functionCache = require('./lib/functionCache');

const instanceCache = require('./lib/instanceCache');

const lib = require('./lib/lib');

module.exports = instanceCache;

utils.extend(module.exports, {
  init: lib.init, // load redis config
  func: functionCache, // function caching
  setOnCache: lib.setOnCache, // set callback called when something has been cached
  unsetOnCache: lib.unsetOnCache, // unset callback called when something has been removed from cache
});
