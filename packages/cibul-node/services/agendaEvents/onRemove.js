"use strict";

const wn = require( 'when/node' );

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
  
  
  const event = await wn.call( oldEventSvc.get, { uid: ae.eventUid } );
  
  coms.publish( config.mainChannel, {
    name: 'legacy.es.event.remove',
    values: {
      id: event.id,
      type: 'remove'
    }
  } );

}