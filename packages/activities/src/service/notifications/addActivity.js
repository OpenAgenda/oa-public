"use strict";

const queue = require( '@openagenda/queue' );

module.exports = config => {
  const q = queue( config.queue.names.addActivity, { redis: config.queue.redis } );

  function addActivity( identifiers, activity, cb ) {

    q( { identifiers, activity }, cb );

  }

  return addActivity;
};
