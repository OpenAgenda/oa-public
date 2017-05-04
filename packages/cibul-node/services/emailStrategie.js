"use strict";

const emailStrategie = require( 'emailStrategie' ),

  logger = require( 'logger' );

module.exports.init = config => {

   emailStrategie.init( {
    database: config.emailStrategieDb,
    redis: config.redis,
    logger
  } );

}