"use strict";

const locations = require( 'agenda-locations' ),

 _ = require( 'lodash' );

let log = console.log;

module.exports = ( uids, options, cb ) => {

  // internal data is not always required
  locations.list( { uid: uids }, 0, uids.length, _.extend( { fromDb: true }, options ), cb );

}

module.exports.setLog = l => log = l;