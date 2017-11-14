"use strict";

const legacy = require( './legacy' );
const events = require( '@openagenda/events' );
const logger = require( 'logger' );

const interfaces = {
  onCreate: require( './onCreate' ),
  onUpdate: require( './onUpdate' ),
  beforeRemove: require( './beforeRemove' ),
  onRemove: require( './onRemove' ),
  getOriginAgendas: require( './getOriginAgendas' ),
  getLocations: require( './getLocations' )
};


module.exports = {
  init,
  legacy
}


function init( config ) {

  events.init( {
    mysql: config.db,
    redis: config.redis,
    logger,
    schemas: {
      event: config.schemas.eventService
    },
    imagePath: config.aws.imageBucketPath,
    defaultImagePath: config.aws.defaultImagePath,
    files: {
      tmpPath: config.tmpFolderPath,
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    legacy: {
      mysql: config.db,
      schemas: config.schemas
    },
    interfaces
  } );

}