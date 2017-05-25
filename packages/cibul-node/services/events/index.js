"use strict";

const events = require( 'events-service' ),

  logger = require( 'logger' ),

  interfaces = {
    onCreate: require( './onCreate' ),
    onUpdate: require( './onUpdate' ),
    beforeRemove: require( './beforeRemove' ),
    onRemove: require( './onRemove' ),
    getOriginAgendas: require( './getOriginAgendas' ),
    getLocations: require( './getLocations' )
  },

  legacy = require( './legacy' );

let log = console.log;

module.exports = {
  init,
  legacy
}


function init( config ) {

  log = logger( 'events/interfaces' );

  Object.keys( interfaces ).forEach( k => interfaces[ k ].setLog( logger( 'events/interfaces/' + k ) ) );

  legacy.setLog( logger( 'events/interfaces/legacy' ) );

  events.init( {
    mysql: config.db,
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