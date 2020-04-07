'use strict';

const _ = require('lodash');
const agendas = require('@openagenda/agendas');
const imageFiles = require('@openagenda/image-files');
const cmn = require('../../lib/commons-app');
const controlDataSvc = require('../legacy').controlData;
const activities = require('../activities');
const { parser: agendaAdminParser } = require('../lib/layouts/agendaAdmin');
const middleware = require('./middleware');

const onCreate = require('./onCreate');
const onUpdate = require('./onUpdate');

const log = require('@openagenda/logs')('services/agendas');

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

module.exports.init = (config, services) => {
  agendas.init({
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
    logger: config.getLogConfig('svc', 'agendas'),
    interfaces: {
      onCreate: onCreate.bind(null, services),
      onRemove: onRemove.bind(null, services),
      onUpdate: onUpdate.bind(null, services),
      beforeRemove,
      imageFilesLoad: imageFiles.load,
      imageFilesClear: imageFiles.clear,
      imageFilesGetBasePath: imageFiles.getBucketPath
    }
  });

  return {
    ...agendas,
    mw: middleware(agendas)
  };
};

module.exports.plugApp = app => {
  const {
    sessions,
    members,
    core
  } = app.services;

  app.get(
    '/:slug/admin/layout',
    sessions.mw.load,
    checkUser,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('moderator', { or: throwUnauthorized }),
    async (req, res, next) => {
      try {
        res.send({
          member: req.member,
          schema: await core.agendas(req.agenda.uid).settings.schema.getMerged(),
          ...agendaAdminParser({
            agenda: req.agenda,
            role: req.member.role,
            lang: req.lang
          })
        })
      } catch (e) {
        next(e);
      }
    }
  );

  app.get(
    '/:slug/settings/schema',
    sessions.mw.load,
    cmn.loadAgenda,
    async (req, res, next) => {
      try {
        const schema = await req.app.services.core.agendas(req.agenda.uid).settings.schema.getMerged();

        res.send({
          ...schema,
          fields: schema.fields.filter(field => field.read === null) // Filter public fields
        });
      } catch (e) {
        next(e);
      }
    }
  );
};


function beforeRemove(agenda, cb) {

  controlDataSvc.clear(agenda.uid).then(cb.bind(null, null), err => {
    log('warn', 'could not clear agenda control data', agenda.uid, err);
    cb();
  });

}


function onRemove(services, agenda) {
  const { Inbox } = services.inboxes;

  // inbox
  log('remove inbox (agenda uid %d)', agenda.uid);
  new Inbox().create({ type: 'agenda', identifier: agenda.uid }).then(_.noop);

  // feed / activity
  activities.feed({ entityType: 'agenda', entityUid: agenda.uid }).remove();
}
