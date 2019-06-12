"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const config = require( './lib/config' );

module.exports = Object.assign( cache, {
  init: c => config.set( c )
} );

function cache( namespace, identifier = null ) {

  if ( !config.client ) throw new VError( 'simple cache needs to be initialized' );

  const cli = config.client;

  return {
    get,
    set,
    clear
  }

  function set( key, value, ttl, cb ) {

    cli.set( _key( key ), value, ( err, result ) => {

      if ( err ) return cb( err );

      cli.expire( _key( key ), ttl, err => {

        if ( err ) return cb( err );

        cb();

      } );

    } );

  }

  function get( key, cb ) {

    cli.get( _key( key ), cb );

  }


  function clear( key, cb ) {



  }

  function _key( key ) {

    const parts = [ config.prefix + namespace, key ];

    if ( identifier !== null ) {

      parts.splice( 1, 0, identifier );

    }

    return parts.join( ':' );

  }

}
