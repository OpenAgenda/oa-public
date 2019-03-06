"use strict";

const VError = require( 'verror' );
const log = require( '@openagenda/logs' )( 'agendaEvents/onUpdate' );

const aggregatorNotify = require( './lib/aggregatorNotify' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const eventSearch = require( '../eventSearch' );
const fallbackContextGet = require( './lib/fallbackContextGet' );
const sendEventUpdate = require( './lib/sendEventUpdate' );
const sendEventChangeState = require( './lib/sendEventChangeState' );

const controlDataSvc = require( '../legacy' ).controlData;

module.exports = async ( before, after, context ) => {

  log( 'updated agenda-event from %j to %j', before, after );

  try {

    await eventSearch.agendas( after.agendaUid ).update( after );

  } catch ( e ) {

    log( 'error', 'could not update event search', e );

  }

  await _sleepALittle(); // legacy search might try to fetch event content before it is committed to db

  const { agenda, event } = await fallbackContextGet( 'onUpdate', after, context );

  coms.publish( config.mainChannel, {
    name: 'legacy.es.event.update',
    values: {
      uid: event.uid,
      type: 'update'
    }
  } );


  if ( after.state === 2 ) {

    try {
      await controlDataSvc.set( after, event );
    } catch ( e ) {
      log( 'error', 'control data set failed', e );
    }

  } else if ( ( before.state === 2 ) && ( after.state !== 2 ) ) {

    try {
      await controlDataSvc.remove( before );
    } catch ( e ) {
      log( 'error', 'control data remove failed', e );
    }

  }

  aggregatorNotify.update( { agenda, event, before, after } );

  // Send emails
  if ( before.state === after.state ) {
    // eventUpdate
    // myEventUpdate
    try {
      await sendEventUpdate( { agendaEvent: after, before, context, agenda, event } );
    } catch ( error ) {
      log.error( new VError( error, 'Cannot send event update emails' ) );
    }
  } else {
    // eventChangeState
    // myEventChangeState
    try {
      await sendEventChangeState( { agendaEvent: after, before, context, agenda, event } );
    } catch ( error ) {
      log.error( new VError( error, 'Cannot send event change state emails' ) );
    }
  }

}

function _sleepALittle() {

  return new Promise( rs => setTimeout( () => rs(), 2000 ) );

}
