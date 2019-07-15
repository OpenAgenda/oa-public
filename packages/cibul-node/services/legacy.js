"use strict";

const ControlData = require( '@openagenda/legacy/controlData' );
const TagsAndCustom = require( '@openagenda/legacy/tagsAndCustom' );

module.exports.controlData = {};
module.exports.tagsAndCustom = {};

module.exports.init = config => {

  ControlData.updateLoggerConfig( config.getLogConfig( 'svc', 'controlData' ) );
  TagsAndCustom.updateLoggerConfig( config.getLogConfig( 'svc', 'legacyTagsAndCustom' ) );

  Object.assign( module.exports.controlData, ControlData( {
    knex: config.knex,
    redis: config.redisClient,
    prefix: 'agendaControlData:',
    imagePath: config.aws.imageBucketPath
  } ) );

  Object.assign( module.exports.tagsAndCustom, TagsAndCustom( {
    knex: config.knex
  } ) );

}
