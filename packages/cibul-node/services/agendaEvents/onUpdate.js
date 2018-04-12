"use strict";

const wn = require( 'when/node' );

const agendasSvc = require( '@openagenda/agendas' );
const aggregator = require( '../aggregator' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const eventSearch = require( '../eventSearch' );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onUpdate' );
const oldEventSvc = require( '../event' );

module.exports = async ( before, after, context ) => {

  log( 'updated agenda-event from %j to %j', before, after, { context } );

  // use context.userUid. Will be null when nothing was specified at update
  
  eventSearch.agendas( after.agendaUid ).update( after );

  if ( context.legacy ) return;

  const agenda = await wn.call( agendasSvc.get, { uid: after.agendaUid }, { internal: true, private: null } );
  
  const event = await wn.call( oldEventSvc.get, { uid: after.eventUid, reviewId: agenda.id } );

  coms.publish( config.mainChannel, {
    name: 'legacy.es.event.update',
    values: {
      id: event.id,
      type: 'update'
    }
  } );

  aggregator.notifyPublish( event.id, agenda.id );

}