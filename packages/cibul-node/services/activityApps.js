"use strict";

const activityAppsMw = require( '@openagenda/activity-apps/dist/middleware' );
const activitiesSvc = require( '../services/activities' );

module.exports.init = config => activityAppsMw.init( {
  limit: 20,
  services: {
    activities: activitiesSvc
  },
  logger: config.getLogConfig( 'svc', 'activity-apps', false )
} );
