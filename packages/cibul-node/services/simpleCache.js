"use strict";

const simpleCache = require( '@openagenda/simple-cache' );

module.exports.init = config => {

   simpleCache.init( {
    redis: config.redis,
    prefix: 'simplecache:'
  } );

}