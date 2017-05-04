"use strict";

const activityAppsMw = require( 'activity-apps/middleware' );

module.exports.init = config => activityAppsMw.init( { limit: 20 } );