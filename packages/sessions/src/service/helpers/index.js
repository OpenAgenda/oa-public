"use strict";

const _ = require( 'lodash' );
const cookieValidate = require( '../../../iso/cookie.validate' );
const log = require( '@openagenda/logs' )( 'helpers' );

module.exports = {
  cleanSession,
  callbackify,
  getUser
}

function getUser( interfaces, identifier ) {

  try {

    return callInterface( interfaces, 'getUser', identifier );

  } catch ( e ) {

    log( 'error', e );

    throw e;

  }

}


function callbackify( p, cb ) {

  p.then( result => {

    // do not handle sync errors in callback with promise
    process.nextTick( cb.bind( null, null, result ) );

  }, err => {

    process.nextTick( cb.bind( null, err ) );

  } );

}


function callInterface( interfaces, name, args ) {

  return new Promise( ( rs, rj ) => {

    interfaces[ name ].apply( null, ( _.isArray( args ) ? args : [ args ] ).concat( ( err, result ) => {

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
