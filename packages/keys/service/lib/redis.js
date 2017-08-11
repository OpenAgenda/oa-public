"use strict";

const config = require( '../config' );

module.exports = {
  set,
  get
};

function set ( key, value ) {

  return config.redis.client.setAsync( _key( key ), value, 'EX', config.cache.duration );

}

function get ( key ) {

  return config.redis.client.getAsync( _key( key ) );

}

function _key( key ) {

  return [ config.redis.prefix, key ].join( ':' );

}
