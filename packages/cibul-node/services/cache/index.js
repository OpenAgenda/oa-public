"use strict";

var cli,

utils = require( '../../lib/utils' ),

redis = require( 'redis' ),

async = require( 'async' ),

log = require( '../../lib/logger' )( 'cache' );

module.exports = instanceCache;

module.exports.init = function( config ) {

  if ( !config ) return;

  cli = redis.createClient( config.port, config.host );

  return module.exports;

}

module.exports.func = functionCache;

// cache from get and an identifying param

function functionCache( namespace, name, func, expire ) {

  if ( !_enabled() ) {

    utils.extend( func, { cache: {
      clear: function() {}
    }});

    return func;

  }

  return utils.extend( wrapper, { cache: {
    clear: clear
  } } );

  function wrapper() {

    var args = Array.prototype.slice.call( arguments ),

    cb = args.pop(),

    cacheLoaderArgs = args;

    // this thing should just cache in with an expiry and a clear.

    _getCache( __key(), JSON.stringify( args ), function( err, data ) {

      if ( !data ) {

        var cacheLoaderArgs = [ __key(), JSON.stringify( args ), func, false ].concat( args );

        cacheLoaderArgs.push( cb );

        return _loadCache.apply( null, cacheLoaderArgs );

      }

      cb( null, data );

    } );

  }

  function clear( cb ) {

    __log( 'clearing' );

    cli.del( __key(), cb );

  }


  function __log( method, message, args ) {

    _log( __key(), method, message, args );

  }

  function __key() {

    var key = [ 'cache', namespace, name ];

    return key.join( ':' );

  }

}


/**
 * @param { string }    type       type of the instance ( ex user, agenda, event )
 * @param { object }    instance   instance to be cached
 * @param { array }     methods    methods to be cached
 * @param { array }     clearers   methods that when called clear the instance cache
 */

function instanceCache( type, instance, methods, clearers ) {

  if ( !_enabled() ) {

    utils.extend( instance, { cache: {
      clear: function() {}
    }});

    return instance;

  }

  if ( !clearers ) clearers = [];

  if ( instance.save ) clearers.push( 'save' );

  var cachedMethods = _wrapMethods( methods ),

  clearerMethods = _wrapClearers( clearers ),

  cacheTimestamp;

  // extend instance with cache specific methods
  return utils.extend( instance, clearerMethods, cachedMethods, { cache: {
    clear: clear,
    getTimestamp: getTimestamp
  } } );

  function _wrapMethods( methods ) {

    var cachedMethods = {};

    methods.forEach( function( methodName ) {

      cachedMethods[ methodName ] = _wrapMethod( methodName, instance[ methodName ] );

    });

    return cachedMethods;

  }


  function _wrapClearers( clearers ) {

    var clearerMethods = {};

    clearers.forEach( function( methodName ) {

      clearerMethods[ methodName ] = _wrapClearer( instance[ methodName ] );

    });

    return clearerMethods;

  }


  /**
   * wrap given function to add a cache clear
   */

  function _wrapClearer( method ) {

    return function() {

      // clears the cache
      clear();

      // while applying the function
      method.apply( null, Array.prototype.slice.apply( arguments ) );

    }

  }


  function _wrapMethod( methodName, method ) {

    return function( cb ) {

      if ( arguments.length > 1 ) {

        return method.apply( null, Array.prototype.slice.apply( arguments ) );

      }

      __log( methodName, 'is cacheable' ); 

      _validTimestamp( function( err, isValid ) {

        if ( isValid ) {

          __log( methodName, 'cache timestamp is valid' );

          _getCache( __key(), methodName, function( err, data ) {

            if ( !data ) {

              __log( methodName, 'no cached data was retrieved' );

              return _loadCache( __key(), methodName, method, false, cb );

            } else {

              __log( methodName, 'cached data was retrieved' );

              cb( null, data );

            }

          } );

        } else {

          __log( methodName, 'cache timestamp is not valid' );

          clear( function( err ) {

            if ( err ) return cb( err );

            _loadCache( __key(), methodName, method, false, cb );

          } );

        }

      });

    }

  }

  function _validTimestamp( cb ) {

    getTimestamp( function( err, cacheTimestamp ) {

      cb( err, instance.updatedAt == cacheTimestamp );

    });

  }

  function getTimestamp( cb ) {

    if ( cacheTimestamp ) {

      return cb( null, cacheTimestamp );

    } else {

      cli.hget( __key(), 'timestamp', cb );

    }

  }

  function clear( cb ) {

    __log( 'clearing' );

    cli.del( __key(), function( err ) {

      if ( err ) return cb( err );

      cacheTimestamp = instance.updatedAt;

      cli.hset( __key(), 'timestamp', cacheTimestamp, function( err ) {

        if ( cb ) cb( err );

      } );

    });

  }

  function __log( method, message, args ) {

    _log( __key(), method, message, args );

  }

  function __key() {

    var key = [ 'cache', 'instance', type, instance.id ];

    return key.join( ':' );

  }

}


function _getCache( key, subKey, cb ) {

  var cachedData;

  cli.hget( key, subKey, function( err, data ) {

    try {

      cachedData = JSON.parse( data );

    } catch( e ) {

      cb( 'Invalid cached data' );

      return;

    }

    cb( null, cachedData );

  } );

}


function _loadCache( key, subKey, method, expire, args, cb ) {

  var args = Array.prototype.slice.call( arguments ),

  cb = args.pop();

  args.splice( 0, 4 );


  args.push( function( err, data ) {

    cli.hset( key, subKey, JSON.stringify( data ), function( err, result ) {

      // if expire is set, define it here
      if ( expire ) cli.expire( key, expire / 1000 );

      if ( err ) return cb( err );

      cb( null, data );

    } );

  } );

  method.apply( null, args );

}


function _enabled() {

  if ( !cli ) {

    return false;

  }

  return true;

}


function _log( key, method, message, args ) {

  log.apply( null, [ '%s.%s - ' + message, key, method ].concat( args ? args : [] ) );

}