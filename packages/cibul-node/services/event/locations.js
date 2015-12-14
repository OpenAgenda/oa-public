"use strict";

var coms = require( '../../lib/coms' ),

model = require( '../model' ),

config = require( '../../config' ),

async = require( 'async' ),

svc;

module.exports = function( s ) {

  svc = s;

  return {
    getEventCount: model.locations().getEventCount,
    locationWillRemove: locationWillRemove,
    locationDidUpdate: locationDidUpdate,
    locationsWillMerge: locationsWillMerge
  }

}


/**
 * delete events linked with location
 */

function locationWillRemove( locationId, cb ) {

  model.locations().getRelatedEventIds( locationId, ( err, eventIds ) => {

    async.eachSeries( eventIds, ( eventId, ecb ) => {

      svc.get( { id: eventId }, ( err, event ) => {

        if ( err ) return ecb( err );

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

  async.eachSeries( locationIds, ( locationId, ecb ) => {

    _transferEventLocations( locationId, mergeInLocationId, ecb );

  }, cb );

}

function _transferEventLocations( fromLocationId, toLocationId, cb ) {

  model.locations().getRelatedEventIds( fromLocationId, ( err, eventIds ) => {

    async.eachSeries( eventIds, ( eventId, ecb ) => {

      svc.get( { id: eventId }, ( err, event ) => {

        if ( err ) {

          log( 'error', 'could not retrieve event %s', eventId );

          return ecb();

        }

        event.changeLocation( toLocationId, ecb );

      } );

    }, cb );

  } );

}