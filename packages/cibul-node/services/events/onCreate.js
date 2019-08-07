"use strict";

const users = require( '@openagenda/users' );
const log = require( '@openagenda/logs' )( 'events/interfaces/onCreate' );
const activitiesSvc = require( '../activities' );
const eventSearch = require( '../eventSearch' );

module.exports = ( event, context ) => {

  log( 'info', 'created event %s with context %j', event.uid, context );

  if ( event.creatorUid ) _unsetNewUser( event );

  _registerActivity( event );

  if ( !event.draft ) {

    eventSearch.events.add( event.uid, { queue: true } );

  }

}


async function _registerActivity( event ) {

  try {

    await activitiesSvc.feed( {
      entityType: 'event',
      entityUid: event.uid,
    } ).create();

  } catch ( err ) {

    log( 'error', err );

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
