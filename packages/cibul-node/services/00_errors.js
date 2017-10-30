"use strict";

const log = require( 'logs' )( 'uncaught' );

const _ = require( 'lodash' );

process.on( 'uncaughtException', handler.bind( null, 'uncaughtException' ) );

process.on( 'unhandledRejection', handler.bind( null, 'unhandledRejection' ) );

module.exports = handler;

module.exports.init = c => {

  log.setConfig( {
    token: process.env.NODE_ENV === 'production' ? '98b067ad-0fb6-4047-8e61-be29141004b9' : null
  } );

}

function handler( namespace, err ) {

  try {

    throw err;

  } catch ( error ) {

    if ( process.env.NODE_ENV === 'production' ) {

      console.error( '%s %s: %j', ( new Date ).toUTCString(), namespace, error );

    }

    log( 'error', _.extend( {
      namespace,
      error
    }, process.env.NODE_ENV === 'production' ? {
      stack: _.get( error, 'stack', '' ).split( '\n' )
    } : {} ) );

  }

}