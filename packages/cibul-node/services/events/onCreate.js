"use strict";

const log = require( '@openagenda/logs' )( 'events/interfaces/onCreate' );
const activitiesSvc = require( '../activities' );
const eventSearch = require( '../eventSearch' );
const app = require( '../../app' );

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

  const usersSvc = app.service( '/users' );

  usersSvc.get( event.creatorUid )
    .then( async user => {

      if ( user && user.isNew ) {

        await usersSvc.setNewFlag( event.creatorUid, { isNew: false } );

      }

    } )
    .catch( err => {

      log( 'error', err );

    } );

}
