"use strict";

const logger = require( 'logger' );

const activityAppsMw = require( 'activity-apps/middleware' );

module.exports.init = config => activityAppsMw.init( { limit: 20, logger } );