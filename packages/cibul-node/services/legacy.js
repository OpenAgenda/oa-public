"use strict";

const ControlData = require( '@openagenda/legacy/controlData' );

module.exports.controlData = {};

module.exports.init = config => {

  ControlData.updateLoggerConfig( config.getLogConfig( 'svc', 'controlData' ) );

  Object.assign( module.exports.controlData, ControlData( {
    knex: config.knex,
    redis: config.redisClient,
    prefix: 'agendaControlData:',
    imagePath: config.aws.imageBucketPath
  } ) );

}
