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
    locationWillRemove,
    locationDidUpdate,
    locationsWillMerge,
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


/**
 * delete events linked with location
 */

function locationWillRemove( locationId, cb ) {

  log( 'removing events associated with location %s', locationId );

  model.locations().getRelatedEventIds( locationId, ( err, eventIds ) => {

    log( 'events associated with location %s are %s', locationId, eventIds.join( ', ' ) );

    async.eachSeries( eventIds, ( eventId, ecb ) => {

      log( 'triggering removal of event %s', eventId );

      svc.get( { id: eventId, isNew: null }, ( err, event ) => {

        if ( err ) return ecb( err );

        if ( !event ) {

          log( 'error', 'could not find event %s', eventId );

          return ecb( err );

        }

        event.remove( ecb );

      } );

    }, cb );

  });

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

function locationsWillMerge( mergeInLocationId, locationIds, cb ) {

  log( 'initiating location merge of locations %s into %s', JSON.stringify( locationIds ), mergeInLocationId );

  async.eachSeries( locationIds, ( locationId, ecb ) => {

    _transferEventLocations( locationId, mergeInLocationId, ecb );

  }, cb );

}

function _transferEventLocations( fromLocationId, toLocationId, cb ) {

  log( 'transfering events from location %s to %s', fromLocationId, toLocationId );

  model.locations().getRelatedEventIds( fromLocationId, ( err, eventIds ) => {

    async.eachSeries( eventIds, ( eventId, ecb ) => {

      svc.get( { id: eventId }, ( err, event ) => {

        if ( err ) {

          log( 'error', 'could not retrieve event %s', eventId );

          return ecb();

        }

        event.changeLocation( toLocationId, err => {

          if ( err ) return ecb( err );

          event.refresh( ecb );

        } );

      } );

    }, cb );

  } );

}