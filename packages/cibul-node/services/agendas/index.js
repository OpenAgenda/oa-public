import agendasSvc from '@openagenda/agendas';
import cmn from '../../lib/commons-app.js';
import agendaAdminLayout from '../lib/layouts/agendaAdmin/index.js';
import middleware from './middleware.js';
import resetCache from './lib/resetCache.js';
import onCreate from './onCreate.js';
import onUpdate from './onUpdate.js';
import onRemove from './onRemove.js';

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
  cb();
}

function plugApp(app) {
  const { agendas, sessions, members, core } = app.services;

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
          schema: await core.agendas(req.agenda.uid).settings.schema.getMerged({
            includeMemberSchema: true,
            includeMember: true,
          }),
          ...agendaAdminLayout.parser({
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
        const schema = await req.app.services.core
          .agendas(req.agenda.uid)
          .settings.schema.getMerged();

        res.send({
          ...schema,
          fields: schema.fields.filter((field) => field.read === null), // Filter public fields
        });
      } catch (e) {
        next(e);
      }
    },
  );
}

export function init(config, services) {
  agendasSvc.init({
    knex: config.knex,
    schemas: config.schemas,
    Files: services.files,
    imagePath: config.s3.mainBucketPath,
    defaultImagePath: config.s3.defaultImagePath,
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
    plugApp,
  };
}
