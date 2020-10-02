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
const onRemove = require('./onRemove');

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
    Files: services.files,
    imagePath: config.aws.imageBucketPath,
    defaultImagePath: config.aws.defaultImagePath,
    logger: config.getLogConfig('svc', 'agendas'),
    interfaces: {
      onCreate: onCreate.bind(null, services),
      onRemove: onRemove.bind(null, services),
      onUpdate: onUpdate.bind(null, services),
      beforeRemove
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
    sessions.mw.load(),
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
    sessions.mw.load(),
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

function removeImage(services, imagePath) {
  const { files } = services;
  const { s3 } = files.providers;

  const match = imagePath.match(/(?<name>.*)(?<ext>\..*)(?<query>\?.*)/);

  if (!match) {
    return;
  }

  const { name, ext } = match.groups;

  return s3.remove([
    `${name}${ext}`,
    `rwtb${name}${ext}`,
    `${name}_o${ext}`
  ]);
}
