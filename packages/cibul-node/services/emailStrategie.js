"use strict";

const emailStrategie = require( '@openagenda/email-strategie' ),

  logger = require( 'logger' );

module.exports.init = config => {

   emailStrategie.init( {
    database: config.emailStrategieDb,
    redis: config.redis,
    logger
  } );

}