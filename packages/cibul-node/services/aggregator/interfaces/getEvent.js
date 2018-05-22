"use strict";

const events = require( '@openagenda/events' );

module.exports = getQuery => {

  return events.get( getQuery, { internal: true, private: null } );

}