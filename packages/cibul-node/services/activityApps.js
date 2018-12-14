"use strict";

const activityAppsMw = require( '@openagenda/activity-apps/dist/middleware' );
const activitiesSvc = require( '@openagenda/activities' );
const config = require( '../config' );

module.exports.init = config => activityAppsMw.init( {
  limit: 20,
  services: {
    activities: activitiesSvc
  },
  logger: config.getLogConfig( 'svc', 'activity-apps', false )
} );
