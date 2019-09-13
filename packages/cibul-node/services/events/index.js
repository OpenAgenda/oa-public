"use strict";

const events = require( '@openagenda/events' );
const imageFiles = require( '@openagenda/image-files' );
const legacy = require( './legacy' );

const interfaces = {
  onCreate: require( './onCreate' ),
  onUpdate: require( './onUpdate' ),
  beforeRemove: require( './beforeRemove' ),
  onRemove: require( './onRemove' ),
  getOriginAgendas: require( './getOriginAgendas' ),
  getLocations: require( './getLocations' ),
  imageFilesLoad: imageFiles.load
};


module.exports = {
  init
}


function init( config ) {
  events.init( {
    knex: config.knex,
    mysql: config.db,
    redis: config.redis,
    logger: config.getLogConfig( 'svc', 'events' ),
    schemas: {
      event: config.schemas.eventService
    },
    image: {
      base: config.aws.imageBucketPath,
      default: config.aws.defaultImagePath,
      formats: [ {
        name: '{fileKey}.base.image.jpg',
        format: { width: 700 },
        variant: 'base',
        sizeLimits: config.imageSizeLimits
      }, {
        name: '{fileKey}.full.image.jpg',
        variant: 'full',
        sizeLimits: config.imageSizeLimits
      }, {
        name: '{fileKey}.thumb.image.jpg',
        format: { width: 200, height: 200, crop: true },
        variant: 'thumbnail',
        sizeLimits: config.imageSizeLimits
      } ]
    },
    legacy: {
      mysql: config.db,
      schemas: config.schemas
    },
    interfaces
  } );

  Object.assign(module.exports, events, {init});

  return events;
}
