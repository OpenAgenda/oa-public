"use strict";

const _ = require( 'lodash' );

const eventSvc = require( '@openagenda/events' );
const log = require( '@openagenda/logs' )( 'services/agendaLocations/locationsWillMerge' );

module.exports = ( mergeInLocation, locations, cb ) => {

  log( 'info', 'processing event updates for merging of locations %j into %s', locations.map( l => l.uid ), mergeInLocation.uid );

  locationsWillMerge( mergeInLocation, locations ).then( () => cb(), cb );

}

async function locationsWillMerge( mergeInLocation, locations ) {

  const newLocationUid = _.get( mergeInLocation, 'uid' );

  for ( const locationUid of locations.map( l => l.uid ) ) {

    await _updateEventLocationUids( locationUid, newLocationUid );

  }

}

async function _updateEventLocationUids( locationUid, newLocationUid ) {

  let uid = null, offset = 0;

  while ( uid = _.get( await eventSvc.list( { locationUid }, offset, 1, { private: null } ), 'events.0.uid' ) ) {

    log( 'updating location uid of event %s from %s to %s', uid, locationUid, newLocationUid );

    try {

      await eventSvc.update( { uid }, {
        locationUid: newLocationUid
      }, { transferToLegacy: true } );

    } catch ( e ) {

      offset++;

      log( 'error', 'failed to update event %s with location uid %s', uid, locationUid, e );

    }

  }

}
