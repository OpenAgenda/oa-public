"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );
const getLocation = promisify( require( '@openagenda/agenda-locations' ).get );

module.exports = eventData => {

  const locationUid = _.get( eventData, 'location.uid', _.get( eventData, 'locationUid' ) );

  if ( !locationUid ) return null;

  return getLocation( { uid: locationUid }, { instanciate: false, fromDb: true } );

}
