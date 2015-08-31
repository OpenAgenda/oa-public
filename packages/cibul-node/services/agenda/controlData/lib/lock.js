"use strict";

/**
 * small warlock wrapper
 */

var redis = require( 'redis' ),

warlock = require( 'node-redis-warlock' ),

namespace, globalUnlock, cli;

module.exports = lock;

module.exports.init = init;

module.exports.test = {
  clear: clear
};

function lock( cb ) {

  if ( !cli ) return cb( 'lock: redis config not available' );

  var w = warlock( cli );

  w.lock( namespace, 10000, function( err, unlock ) {

    if ( err ) return cb( err );

    if ( typeof unlock === 'function' ) {

      cb( null, unlock );

    }

  });

}

function init( cfg ) {

  cli = redis.createClient( cfg.redis.port, cfg.redis.host );

  namespace = cfg.namespace;

}

function clear( cb ) {

  cli.del( namespace + ':lock', function() {

    cb();

  } );

}