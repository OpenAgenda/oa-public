"use strict";

const _ = require( 'lodash' );

const events = require( '@openagenda/events' );
const log = require( '@openagenda/logs' )( 'events/interfaces/legacy' );

module.exports = {
  onCreate: _transfer,
  onUpdate: _transfer,
  onRemove: _legacyRemove
}

function _transfer( event, context, cb ) {

  events.legacy.transfer( event, { context }, ( err, result ) => {

    if ( err ) {

      log( 'error', 'event %s transfer failed: %s', event.uid, err );

    } else if ( !result.transferred ) {

      log( 'error', 'event %s could not be transferred: %j', event.uid, _.get( result, 'errors' ) );

    } else if ( result.event.draft ) {

      log( 'info', 'event %s transferred as draft', result.event.uid, result.complete );

    } else {

      log( 'info', 'event %s successfully transferred: %s', result.event.uid, result.created ? 'creation' : 'update' );

    }

    if ( cb ) cb( err );

  } );

}

function _legacyRemove( event, context ) {

  events.remove( { uid: event.uid }, { context: { ...context, deletion: true } }, ( err, result ) => {

    if ( err ) {

      log( 'error', 'event %s remove failed: %j', event.uid, err );

    } else if ( result.success ) {

      log( 'info', 'event %s remove successful', event.uid );

    } else {

      log( 'info', 'event %s remove not performed', event.uid );

    }

  } );

}
