"use strict";

const logger = require( '@openagenda/logger' );

const activityAppsMw = require( '@openagenda/activity-apps/dist/middleware' );
const activitiesSvc = require( '@openagenda/activities' );

module.exports.init = config => activityAppsMw.init( {
  limit: 20,
  services: {
    activities: activitiesSvc
  },
  logger
} );
