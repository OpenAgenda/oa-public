"use strict";

const logger = require( 'logger' );

const activityAppsMw = require( 'activity-apps/middleware' );
const activitiesSvc = require( '@openagenda/activities' );

module.exports.init = config => activityAppsMw.init( {
  limit: 20,
  services: {
    activities: activitiesSvc
  },
  logger
} );
