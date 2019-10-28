"use strict";

const _ = require( 'lodash' );
const agendas = require( '@openagenda/agendas' );
const imageFiles = require( '@openagenda/image-files' );
const { Inbox } = require( '@openagenda/inboxes' );
const cmn = require('../../lib/commons-app');
const controlDataSvc = require( '../legacy' ).controlData;
const activities = require( '../activities' );
const { parser: agendaAdminParser } = require('../lib/layouts/agendaAdmin');
const middleware = require('./middleware');

const onCreate = require( './onCreate' );
const onUpdate = require( './onUpdate' );

const log = require( '@openagenda/logs' )( 'services/agendas' );

const throwUnauthorized = (req, res, next) => {
  const error = new Error('Unauthorized');

  error.statusCode = 401;
  res.statusCode = 401;

  next(error);
};

const checkUser = (req, res, next) => {
  if (!req.user) {
    return throwUnauthorized(req, res, next);
  }

  return next();
};

module.exports.init = config => {
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

  return {
    ...agendas,
    mw: middleware(agendas)
  }
}

module.exports.plugApp = app => {
  const {
    sessions,
    members
  } = app.services;

  app.get(
    '/:slug/admin/layout',
    sessions.mw.load,
    checkUser,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('administrator', { or: throwUnauthorized }),
    (req, res) => res.send(agendaAdminParser({
      agenda: req.agenda,
      role: req.member.role,
      lang: req.lang
    }))
  );
};


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
