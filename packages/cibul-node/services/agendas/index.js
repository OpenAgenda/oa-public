'use strict';

const logs = require('@openagenda/logs');
const agendasSvc = require('@openagenda/agendas');

const cmn = require('../../lib/commons-app');
const controlDataSvc = require('../legacy').controlData;
const { parser: agendaAdminParser } = require('../lib/layouts/agendaAdmin');
const middleware = require('./middleware');
const resetCache = require('./lib/resetCache');

const onCreate = require('./onCreate');
const onUpdate = require('./onUpdate');
const onRemove = require('./onRemove');

const log = logs('services/agendas');

const throwUnauthorized = (req, res, next) => {
  const error = new Error('Unauthorized');

  error.statusCode = 401;
  res.statusCode = 401;

  next(error);
};

const throwForbidden = (req, res, next) => {
  const error = new Error('Forbidden');

  error.statusCode = 403;
  res.statusCode = 403;

  next(error);
};

const checkUser = (req, res, next) => {
  if (!req.user) {
    return throwUnauthorized(req, res, next);
  }

  return next();
};

function beforeRemove(agenda, cb) {
  controlDataSvc.clear(agenda.uid).then(cb.bind(null, null), err => {
    log('warn', 'could not clear agenda control data', agenda.uid, err);
    cb();
  });
}

module.exports.init = (config, services) => {
  agendasSvc.init({
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
      beforeRemove,
    },
  });

  return {
    ...agendasSvc,
    mw: middleware(agendasSvc),
    resetCache: resetCache.bind(null, services),
  };
};

module.exports.plugApp = app => {
  const {
    agendas,
    sessions,
    members,
    core,
  } = app.services;

  app.get(
    '/:slug/admin/layout',
    sessions.mw.load(),
    checkUser,
    cmn.loadAgenda,
    members.mw.loadAndAuthorize('moderator', { or: throwForbidden }),
    agendas.mw.authorizeByIPAddress(),
    async (req, res, next) => {
      try {
        res.send({
          member: req.member,
          schema: await core.agendas(req.agenda.uid).settings.schema.getMerged(),
          ...agendaAdminParser({
            agenda: req.agenda,
            role: req.member.role,
            lang: req.lang,
          }),
        });
      } catch (e) {
        next(e);
      }
    },
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
          fields: schema.fields.filter(field => field.read === null), // Filter public fields
        });
      } catch (e) {
        next(e);
      }
    },
  );
};
