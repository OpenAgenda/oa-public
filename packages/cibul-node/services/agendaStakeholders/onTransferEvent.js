"use strict";

const events = require( 'events-service' ),

  VError = require( 'verror' );

let log = console.log;

module.exports = eventUid => {

  events.legacy.transfer( { uid: eventUid }, ( err, result ) => {

    if ( err ) {

      log( 'error', new VError( err, 'could not transfer legacy event on event ownership transfer' ) );

    } else {

      log( 'info', result );

    }

  } );

}

module.exports.setLog = l => log = l;