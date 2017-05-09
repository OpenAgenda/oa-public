"use strict";

const events = require( 'events-service' ),

  logger = require( 'logger' ),

  interfaces = {
    onCreate: require( './onCreate' ),
    onUpdate: require( './onUpdate' ),
    beforeRemove: require( './beforeRemove' ),
    onRemove: require( './onRemove' )
  };

let log = console.log;

module.exports.init = config => {

  log = logger( 'events/interfaces' );

  events.init( {
    mysql: config.db,
    schemas: {
      event: config.schemas.eventService
    },
    imagePath: config.aws.imageBucketPath,
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

module.exports.legacy = {
  onCreate: _transfer,
  onUpdate: _transfer,
  onRemove: _legacyRemove
}

function _transfer( event ) {

  events.legacy.transfer( event, ( err, result ) => {

    if ( err ) {

      return log( 'error', 'event %s transfer failed: %s', event.uid, err );

    }

    log( 'info', 'event %s successfully transfered: %s', result.event.uid, result.created ? 'creation' : 'update' );

  } );

}

function _legacyRemove( event ) {

  events.remove( { uid: event.uid }, ( err, result ) => {

    if ( err ) {

      log( 'error', 'event %s remove failed: %s', err );

    } else if ( result.success ) {

      log( 'info', 'event %s remove successful', event.uid );

    } else {

      log( 'info', 'event %s remove not performed', event.uid );

    }

  } );

}