"use strict";

const emailStrategie = require( '@openagenda/email-strategie' ),

  logger = require( '@openagenda/logger' );

module.exports.init = config => {

   emailStrategie.init( {
    database: config.emailStrategieDb,
    redis: config.redis,
    logger
  } );

}