"use strict";

const _ = require( 'lodash' );
const locations = require( '@openagenda/agenda-locations' );

module.exports = ( uids, options, cb ) => {

  // internal data is not always required
  locations.list( { uid: uids }, 0, uids.length, _.extend( { fromDb: true }, options ), cb );

}
