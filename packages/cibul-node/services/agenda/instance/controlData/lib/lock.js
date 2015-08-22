"use strict";

/**
 * small warlock wrapper
 */

var redis = require( 'redis' ),

warlock = require( 'node-redis-warlock' ),

redisConfig, namespace, globalUnlock;

module.exports = lock;

module.exports.init = init;

module.exports.test = {
  clear: clear
};

function lock( cb ) {

  if ( !redisConfig ) return cb( 'lock: redis config not available' );

  var w = warlock( redis.createClient( redisConfig.port, redisConfig.host ) );

  w.lock( namespace, 10000, function( err, unlock ) {

    if ( err ) return cb( err );

    if ( typeof unlock === 'function' ) {

      cb( null, unlock );

    }

  });

}

function init( cfg ) {

  redisConfig = cfg.redis;

  namespace = cfg.namespace;

}

function clear( cb ) {

  var cli = redis.createClient( redisConfig.port, redisConfig.host );

  cli.del( namespace + ':lock', function() {

    cli.end();

    cb();

  } );

}