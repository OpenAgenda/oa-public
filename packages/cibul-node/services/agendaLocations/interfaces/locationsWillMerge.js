"use strict";

const _ = require('lodash');

const log = require('@openagenda/logs')('services/agendaLocations/locationsWillMerge');

module.exports = (services, mergeInLocation, locations, cb ) => {

  log( 'info', 'processing event updates for merging of locations %j into %s', locations.map( l => l.uid ), mergeInLocation.uid );

  locationsWillMerge(services, mergeInLocation, locations).then( () => cb(), cb );

}

async function locationsWillMerge(services, mergeInLocation, locations) {

  const newLocationUid = _.get( mergeInLocation, 'uid' );

  for (const locationUid of locations.map( l => l.uid )) {

    await _updateEventLocationUids(services, locationUid, newLocationUid );

  }

}

async function _updateEventLocationUids(services, locationUid, newLocationUid) {
  const {
    events: eventSvc
  } = services;

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
