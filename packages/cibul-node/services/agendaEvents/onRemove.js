"use strict";

const wn = require( 'when/node' );

const agendasSvc = require( '@openagenda/agendas' );
const aggregator = require( '../aggregator' );
const eventSearch = require( '../eventSearch' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const oldEventSvc = require( '../event' );

const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onRemove' );

module.exports = async ( ae, context ) => {

  log( 'removed agenda-event %j', ae, { context } );

  // use context.userUid. will be null if nothing was specified at remove
  
  eventSearch.agendas( ae.agendaUid ).remove( ae );

  if ( context.legacy ) return;

  /**
   * Anything happening hear should not be triggered elsewhere by legacy parts of app
   */
  
  const agenda = await wn.call( agendasSvc.get, { uid: ae.agendaUid }, { internal: true, private: null } );

  const event = await wn.call( oldEventSvc.get, { uid: ae.eventUid } );

  if ( !event ) {

    log( 'error', 'could not retrieve event for removal of %j', ae );

    return;

  }
  
  coms.publish( config.mainChannel, {
    name: 'legacy.es.event.remove',
    values: {
      id: event.id,
      type: 'remove'
    }
  } );

  aggregator.notifyUnpublish( event.id, agenda.id );

}
