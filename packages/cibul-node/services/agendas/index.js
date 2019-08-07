"use strict";

const _ = require( 'lodash' );
const agendas = require( '@openagenda/agendas' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const imageFiles = require( '@openagenda/image-files' );
const users = require( '@openagenda/users' );
const { Inbox } = require( '@openagenda/inboxes' );
const activities = require( '../activities' );
const controlDataSvc = require( '../legacy' ).controlData;

const onCreate = require( './onCreate' );
const onUpdate = require( './onUpdate' );

const log = require( '@openagenda/logs' )( 'services/agendas' );

module.exports.init = config=> {

  agendas.init( {
    knex: config.knex,
    mysql: config.db, // used by legacy unique value lib
    schemas: config.schemas,
    files: {
      tmpPath: config.tmpFolderPath,
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    existingRoles: agendaStakeholders.types.types,
    imagePath: config.aws.imageBucketPath,
    defaultImagePath: config.aws.defaultImagePath,
    logger: config.getLogConfig( 'svc', 'agendas' ),
    interfaces: {
      onCreate,
      onUpdate,
      beforeRemove,
      onRemove,
      imageFilesLoad: imageFiles.load,
      imageFilesClear: imageFiles.clear,
      imageFilesGetBasePath: imageFiles.getBucketPath
    }
  } );

}


function beforeRemove( agenda, cb ) {

  controlDataSvc.clear( agenda.uid ).then( cb.bind( null, null ), err => {
    log( 'warn', 'could not clear agenda control data', agenda.uid, err );
    cb();
  } );

}


function onRemove( agenda ) {

  // inbox
  log( 'remove inbox (agenda uid %d)', agenda.uid );
  new Inbox().create( { type: 'agenda', identifier: agenda.uid } ).then( _.noop );

  // feed / activity
  activities.feed( { entityType: 'agenda', entityUid: agenda.uid } ).remove();

}
