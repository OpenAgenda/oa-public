"use strict";

var utils = require( '../../../lib/utils' ),

lib = require( './lib' ),

log = require( '@openagenda/logs' )( 'instance cache' );

/**
 * @param { string }    type       type of the instance ( ex user, agenda, event )
 * @param { object }    instance   instance to be cached
 * @param { array }     methods    methods to be cached
 * @param { array }     clearers   methods that when called clear the instance cache
 */

module.exports = function( type, instance, methods, clearers ) {

  var key = _setCacheKey( type, instance );

  if ( !lib.enabled() ) {

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

      _log( methodName, 'is cacheable' );

      _validTimestamp( function( err, isValid ) {

        if ( isValid ) {

          _log( methodName, 'cache timestamp is valid' );

          lib.get( key, methodName, function( err, data ) {

            if ( !data ) {

              _log( methodName, 'no cached data was retrieved' );

              return lib.load( [ key, methodName ], method, false, cb );

            } else {

              _log( methodName, 'cached data was retrieved' );

              cb( null, data );

            }

          } );

        } else {

          _log( methodName, 'cache timestamp is not valid' );

          clear( function( err ) {

            if ( err ) return cb( err );

            lib.load( [ key, methodName ], method, false, cb );

          } );

        }

      });

    }

  }

  function _validTimestamp( cb ) {

    getTimestamp( function( err, cacheTimestamp ) {

      cb( err, _stringifyTimestamp( instance.updatedAt ) == _stringifyTimestamp( cacheTimestamp ) );

    });

  }

  function getTimestamp( cb ) {

    if ( cacheTimestamp ) {

      return cb( null, cacheTimestamp );

    } else {

      lib.getCli().hget( key, 'timestamp', cb );

    }

  }

  function clear( cb ) {

    _log( 'clearing' );

    lib.getCli().del( key, function( err ) {

      if ( err ) return cb( err );

      cacheTimestamp = instance.updatedAt;

      lib.getCli().hset( key, 'timestamp', cacheTimestamp, function( err ) {

        if ( cb ) cb( err );

      } );

    });

  }

  function _log( method, message, args ) {

    log.apply( null, [ '%s.%s - ' + message, key, method ].concat( args ? args : [] ) );

  }

}


function _setCacheKey( type, instance ) {

  return [ 'cache', 'instance', type, instance.id ].join( ':' );

}

/**
 * format timestamp like this: 2015-06-09T14:04:03.000Z
 */

function _stringifyTimestamp( t ) {

  if ( typeof t == 'string' && t.indexOf( 'GMT') !== -1 ) {

    t = new Date( t );

  }

  if ( typeof t == 'object' ) t = JSON.parse( JSON.stringify( t ) );

  return t;

}
