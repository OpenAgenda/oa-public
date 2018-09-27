"use strict";

const users = require( '@openagenda/users' );
const eventSearch = require( '../eventSearch' );
const log = require( '@openagenda/logs' )( 'events/interfaces/onCreate' );

module.exports = ( event, context ) => {

  log( 'info', 'created event %s with context %j', event.uid, context );

  if ( event.creatorUid ) _unsetNewUser( event );

  if ( !event.draft ) {

    eventSearch.events.add( event.uid, { queue: true } );

  }

}

function _unsetNewUser( event ) {

  users.get( event.creatorUid )
    .then( async user => {

      if ( user && user.isNew ) {

        await users.setNewFlag( event.creatorUid, false );

      }

    } )
    .catch( err => {

      log( 'error', err );

    } );

}
