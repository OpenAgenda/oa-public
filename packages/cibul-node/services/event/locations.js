"use strict";

const async = require( 'async' );

const config = require( '../../config' );

const model = require( '../model' );

const stakeholders = require( '@openagenda/agenda-stakeholders' );

const log = require( '@openagenda/logs' )( 'services/event/locations' );

let svc;

module.exports = function( s ) {

  svc = s;

  return {
    getEventCount,
    locationDidUpdate,
    getStakeholder
  }

}


function getEventCount( identifiers, cb ) {

  model.locations().getEventCount( identifiers, {
    agendaId: identifiers.agendaId
  }, ( err, agendaEventsCount ) => {

    if ( err ) return cb( err );

    model.locations().getEventCount( identifiers, ( err, allEventsCount ) => {

      if ( err ) return cb( err );

      cb( null, agendaEventsCount, allEventsCount );

    } );

  } )

}


/**
 * get stakeholder from stakeholder service
 */

function getStakeholder( agendaId, stakeholderId, cb ) {

  stakeholders( agendaId ).get( { id: stakeholderId }, cb );

}


function locationDidUpdate( locationId, cb ) {

  model.locations().getRelatedEventIds( locationId, ( err, eventIds ) => {

    async.eachSeries( eventIds, ( eventId, ecb ) => {

      svc.get( { id: eventId }, ( err, event ) => {

        if ( err ) return cb( err );

        event.refresh( ecb );

      } );

    }, cb );

  } );

}
