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

    return;

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

      _log( methodName, 'is cacheable' );

      _validTimestamp( function( err, isValid ) {

        if ( isValid ) {

          _log( methodName, 'cache timestamp is valid' );

          _getCache( methodName, function( err, data ) {

            if ( !data ) {

              _log( methodName, 'no cached data was retrieved' );

              return _loadCache( methodName, method, cb );

            } else {

              _log( methodName, 'cached data was retrieved' );

              cb( null, data );

            }

          } );

        } else {

          _log( methodName, 'cache timestamp is not valid' );

          clear( function( err ) {

            if ( err ) return cb( err );

            _loadCache( methodName, method, cb );

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

  function _getCache( methodName, cb ) {

    var cachedData;

    cli.hget( _key(), methodName, function( err, data ) {

      try {

        cachedData = JSON.parse( data );

      } catch( e ) {

        cb( 'Invalid cached data' );

        return;

      }

      cb( null, cachedData );

    } );

  }

  function getTimestamp( cb ) {

    if ( cacheTimestamp ) {

      return cb( null, cacheTimestamp );

    } else {

      cli.hget( _key(), 'timestamp', cb );

    }

  }

  function _loadCache( methodName, method, cb ) {

    method( function( err, data ) {

      cli.hset( _key(), methodName, JSON.stringify( data ), function( err, result ) {

        if ( err ) return cb( err );

        cb( null, data );

      } );

    });

  }

  function clear( cb ) {

    _log( 'clearing' );

    cli.del( _key(), function( err ) {

      if ( err ) return cb( err );

      cacheTimestamp = instance.updatedAt;

      cli.hset( _key(), 'timestamp', cacheTimestamp, function( err ) {

        if ( cb ) cb( err );

      } );

    });

  }

  function _log( method, message, args ) {

    log.apply( null, [ '%s.%s - ' + message, _key(), method ].concat( args ? args : [] ) );

  }

  function _key() {

    var key = [ 'cache', type, instance.id ];

    return key.join( ':' );

  }

}




function _enabled() {

  if ( !cli ) {

    return false;

  }

  return true;

}