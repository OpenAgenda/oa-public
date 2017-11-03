"use strict";

const users = require( '@openagenda/users' );
const eventSearch = require( '../eventSearch' );
const log = require( '@openagenda/logs' )( 'events/interfaces/onCreate' );

module.exports = ( event, context ) => {

  log( 'info', 'created event %s with context %j', event.uid, context );

  _unsetNewUser( event );

  eventSearch.events.add( event.uid, { queue: true } );

}

function _unsetNewUser( event ) {

  users.get( { uid: event.creatorUid }, ( err, user ) => {

    if ( err ) return log( 'error', err );

    if ( user && user.is_new ) {

      users.setNewFlag( { uid: event.creatorUid }, false, ( err ) => {

        if ( err ) return log( 'error', err );

      } );

    }

  } );

}