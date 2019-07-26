"use strict";

const VError = require( 'verror' ),

  _ = require( 'lodash' ),

  redis = require( 'redis' );

let config = {};

module.exports = _.extend( config, {
  set
} );

function set( c ) {

  if ( !c.redis ) throw new VError( 'redis configuration is missing' );

  config.prefix = c.prefix || 'simplecache:';

  try {

    config.client = redis.createClient( c.redis.port, c.redis.host );

  } catch( e ) {

    throw new VError( e, 'could not create client' );

  }

}
