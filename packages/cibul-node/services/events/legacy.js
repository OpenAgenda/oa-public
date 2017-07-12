"use strict";

const events = require( 'events-service' );

let log = console.log;

module.exports = {
  onCreate: _transfer,
  onUpdate: _transfer,
  onRemove: _legacyRemove,
  setLog: l => log = l
}

function _transfer( event, cb ) {

  events.legacy.transfer( event, ( err, result ) => {

    if ( err ) {

      log( 'error', 'event %s transfer failed: %s', event.uid, err );

    } else if ( !result.transfered ) {

      log( 'error', 'event %s could not be transfered', event.uid );

    } else {

      log( 'info', 'event %s successfully transfered: %s', result.event.uid, result.created ? 'creation' : 'update' );

    }

    if ( cb ) cb( err );

  } );

}

function _legacyRemove( event ) {

  events.remove( { uid: event.uid }, ( err, result ) => {

    if ( err ) {

      log( 'error', 'event %s remove failed: %s', err );

    } else if ( result.success ) {

      log( 'info', 'event %s remove successful', event.uid );

    } else {

      log( 'info', 'event %s remove not performed', event.uid );

    }

  } );

}