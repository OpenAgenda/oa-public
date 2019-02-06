"use strict";

const _ = require( 'lodash' );

const eventSvc = require( '@openagenda/events' );
const log = require( '@openagenda/logs' )( 'services/agendaLocations/locationsWillRemove' );

module.exports = ( location, cb ) => {

  log( 'info', 'deleting events associated with location of uid %s', location.uid );

  locationsWillRemove( location ).then( () => cb(), cb );

}

async function locationsWillRemove( location ) {

  if ( !location.uid ) throw Error( 'Location uid is not defined' );

  let uid = null, offset = 0;

  while ( uid = _.get( await eventSvc.list( {
    locationUid: location.uid
  }, offset, 1, { private: null } ), 'events.0.uid' ) ) {

    try {

      log( 'deleting event %s', uid );

      await eventSvc.remove( { uid } );

    } catch ( e ) {

      offset++;

      log( 'error', 'failed removing event %s linked to location in deletion %s', uid, location.uid, e );

    }

  }

}
