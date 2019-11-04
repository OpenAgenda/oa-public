"use strict";

const wn = require( 'when/node' );

const agendasSvc = require( '@openagenda/agendas' );
const aggregatorNotify = require( './lib/aggregatorNotify' );
const coms = require( '../../lib/coms' );
const oldEventSvc = require( '../event' );
const legacyEventSearch = require( '../elasticsearch' );

const log = require( '@openagenda/logs' )( 'agendaEvents/onRemove' );

module.exports = async ({ services }, ae, context ) => {

  log( 'removed agenda-event %j', ae, { context } );

  // use context.userUid. will be null if nothing was specified at remove

  services.eventSearch.agendas( ae.agendaUid ).remove( ae );

  const agenda = await wn.call( agendasSvc.get, { uid: ae.agendaUid }, { internal: true, private: null } );

  const event = await wn.call( oldEventSvc.get, { uid: ae.eventUid } );

  // in the case of a deletion, unique legacy ES ref is removed in event interface
  if ( !context.deletion ) {
    try {
      await legacyEventSearch.updateEvent( { uid: ae.eventUid }, { removeUnreferenced: true } );
    } catch ( e ) {
      log( 'error', 'could not update legacy search for event %s', ae.eventUid );
    }
  }

  if ( !event ) {

    log( 'error', 'could not retrieve event for removal of %j', ae );

    return;

  }

  if ( context.legacy ) return;

  aggregatorNotify.remove( { agenda, event } );

}
