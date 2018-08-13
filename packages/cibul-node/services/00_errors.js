"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'uncaught' );

process.on( 'uncaughtException', handler.bind( null, 'uncaughtException' ) );

process.on( 'unhandledRejection', handler.bind( null, 'unhandledRejection' ) );

module.exports = handler;

module.exports.init = c => {

  log.setConfig( c.getLogConfig( 'oa', 'errors', false ) );

}

function handler( namespace, err ) {

  try {

    throw err;

  } catch ( error ) {

    if ( process.env.NODE_ENV === 'production' ) {

      console.error( '%s %s', new Date().toUTCString(), namespace, error );

    }

    log( 'error', _.extend( {
      namespace,
      error
    }, process.env.NODE_ENV === 'production' ? {
      stack: _.get( error, 'stack', '' ).split( '\n' )
    } : {} ) );

  }

}
