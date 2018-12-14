"use strict";

const emailStrategie = require( '@openagenda/email-strategie' );

module.exports.init = config => {

   emailStrategie.init( {
    database: config.emailStrategieDb,
    redis: config.redis
  } );

}
