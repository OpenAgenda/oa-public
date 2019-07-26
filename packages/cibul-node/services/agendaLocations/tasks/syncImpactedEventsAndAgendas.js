"use strict";

const _ = require( 'lodash' );

const agendaEvents = require( '@openagenda/agenda-events' );
const events = require( '@openagenda/events' );
const log = require( '@openagenda/logs' )( 'services/agendaLocations/tasks/reindexImpactedEvents' );

const legacyEventSearch = require( '../../elasticsearch' );
const controlData = require( '../../legacy' ).controlData;

module.exports = async function( before, after ) {

  const uids = await events
    .list( { locationUid: before.uid }, 0, 1000, { fetched: [ 'uid' ] } )
    .then( ( { events } ) => events.map( e => e.uid ) );

  const impactedAgendaUids = [];

  // reindex events
  for ( const uid of uids ) {
    try {
      await legacyEventSearch.updateEvent( { uid } );
    } catch ( e ) {
      log( 'error', 'could not update event %s index', uid, e );
    }
  }

  // update control data of impacted agendas
  for ( const uid of uids ) {
    await agendaEvents.list.byEventUid( uid )
      .then( ( { items } ) => items
        .forEach( ( { agendaUid } ) => {
          impactedAgendaUids.push( agendaUid )
        } )
      );
  }

  for ( const agendaUid of _.uniq( impactedAgendaUids ) ) {
    await controlData.locationSet( { agendaUid, location: after } );
  }

}
