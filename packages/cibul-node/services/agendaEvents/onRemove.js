"use strict";

const wn = require( 'when/node' );

const agendasSvc = require( '@openagenda/agendas' );
const aggregatorNotify = require( './lib/aggregatorNotify' );
const eventSearch = require( '../eventSearch' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const oldEventSvc = require( '../event' );
const legacyEventSearch = require( '../elasticsearch' );

const log = require( '@openagenda/logs' )( 'agendaEvents/onRemove' );

module.exports = async ( ae, context ) => {

  log( 'removed agenda-event %j', ae, { context } );

  // use context.userUid. will be null if nothing was specified at remove

  eventSearch.agendas( ae.agendaUid ).remove( ae );

  const agenda = await wn.call( agendasSvc.get, { uid: ae.agendaUid }, { internal: true, private: null } );

  const event = await wn.call( oldEventSvc.get, { uid: ae.eventUid } );

  /**
   * Anything happening hear should not be triggered elsewhere by legacy parts of app
   */

  if ( context.legacy ) return;

  if ( !event ) {

    log( 'error', 'could not retrieve event for removal of %j', ae );

    return;

  }

  try {
    await legacyEventSearch.updateEvent( _.pick( event, [ 'uid' ] ), { removeUnreferenced: true } );
  } catch ( e ) {
    log( 'error', 'could not update legacy search for event %s', event.slug );
  }

  aggregatorNotify.remove( { agenda, event } );

}
