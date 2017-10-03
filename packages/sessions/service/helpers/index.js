"use strict";

const _ = require( 'lodash' );
const cookieValidate = require( '../../iso/cookie.validate' );
const log = require( 'logs' )( 'helpers' );
const config = require( '../config' );
const redisCommand = require( './redisCommand' );

module.exports = {
  cleanSession,
  interfaces,
  init,
  shutdown,
  callbackify,
  redisCommand
}


function callbackify( p, cb ) {

  p.then( result => {

    // do not handle sync errors in callback with promise
    process.nextTick( cb.bind( null, null, result ) );

  }, err => {

    process.nextTick( cb.bind( null, err ) );

  } );

}


function interfaces( name, args ) {

  return new Promise( ( rs, rj ) => {

    config.interfaces[ name ].apply( null, ( _.isArray( args ) ? args : [ args ] ).concat( ( err, result ) => {  

      if ( err ) return rj( err );

      rs( result );

    } ) );

  } );

}


function cleanSession( session = {}, data = {} ) {

  let filtered = _.pick( session, Object.keys( session ) ),

    clean = {};

  try {

    clean = cookieValidate( _.extend( filtered, data ) );

  } catch( e ) { log( 'error', e ); }

  Object.keys( clean ).forEach( k => session[ k ] = clean[ k ] );

  return session;

}


function init() {

  redisCommand.init();

}

function shutdown() {

  redisCommand.shutdown();

}