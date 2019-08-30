"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'agendaEvents/onUpdate' );

const aggregatorNotify = require( './lib/aggregatorNotify' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const controlDataSvc = require( '../legacy' ).controlData;
const legacyEventSearch = require( '../elasticsearch' );
const eventSearch = require( '../eventSearch' );
const fallbackContextGet = require( './lib/fallbackContextGet' );
const sendEventUpdate = require( './lib/sendEventUpdate' );
const sendEventChangeState = require( './lib/sendEventChangeState' );
const transferCustomFromLegacy = require( './lib/transferCustomFromLegacy' );
const createActivities = require( './lib/createActivities' );

module.exports = async (config, before, after, context) => {
  log( 'updated agenda-event from %j to %j', before, after );
  log( '%sfrom legacy', context.legacy ? '' : 'not ' );

  try {
    await eventSearch.agendas( after.agendaUid ).update( after );
  } catch ( e ) {
    log( 'error', 'could not update event search', e );
  }

  const { agenda, event, user } = await fallbackContextGet( 'onUpdate', after, context );

  try {
    await legacyEventSearch.updateEvent( _.pick( event, [ 'uid' ] ) );
  } catch ( e ) {
    log( 'error', 'could not update legacy search for event %s', event.slug );
  }

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

  if ( context.legacy ) {
    await transferCustomFromLegacy( agenda, event );
  }

  if ( haveRealDiff( before, after ) ) {
    return;
  }

  // Send emails
  if ( before.state === after.state ) {
    // eventUpdate
    // myEventUpdate
    try {
      await sendEventUpdate(config, { agendaEvent: after, before, context, agenda, event });
    } catch (error) {
      log.error( new VError(error, 'Cannot send event update emails' ));
    }
  } else {
    // eventChangeState
    // myEventChangeState
    try {
      await sendEventChangeState(config, { agendaEvent: after, before, context, agenda, event });
    } catch (error) {
      log.error( new VError( error, 'Cannot send event change state emails' ) );
    }
  }

  if ( user ) {
    try {
      await createActivities( { agenda, event, user }, before, after );
    } catch ( e ) {
      log.error( new VError( error, 'Cannot create state change activities' ) );
    }
  }
}

function haveRealDiff( before, after ) {
  _.uniq( [ ...Object.keys( before ), ...Object.keys( after ) ] )
    .filter( key => [ 'createdAt', 'updatedAt', 'state' ].includes( key ) && before[ key ] !== after[ key ] )
    .length > 0;
}
