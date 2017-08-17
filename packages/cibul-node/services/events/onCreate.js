"use strict";

const users = require( 'users' );

const eventSearch = require( '../eventSearch' );

let log = console.log;

module.exports = ( event, context ) => {

  log( 'created event %s with context %s', event.uid, JSON.stringify( context ) );

  _unsetNewUser( event );

  eventSearch.events.add( event.uid, { queue: true } );

}

module.exports.setLog = l => log = l;


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