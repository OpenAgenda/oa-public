"use strict";

const _ = require( 'lodash' ),

  config = require( './lib/config' ),

  VError = require( 'verror' );

module.exports = _.extend( cache, { 
  init: c => config.set( c )
} );

function cache( namespace, identifier ) {

  if ( !config.client ) throw new VError( 'simple cache needs to be initialized' );

  let cli = config.client;

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

    return config.prefix + namespace + ':' + identifier + ':' + key;

  }

}