'use strict';

const _ = require('lodash');
const VError = require('@openagenda/verror');
const sessions = require('@openagenda/sessions');
const log = require('@openagenda/logs')('sessions');
const getAuthMessageLabel = require('@openagenda/labels')(require('@openagenda/labels/auth/messages'));

const service = {};

module.exports = service;

function getUser(services, imageBucketPath, query, cb) {
  log('info', 'requested user with %j', query);

  services.users.findOne({ query: _.pick(query, 'id', 'uid', 'email'), detailed: true })
    .then(user => {
      if (!user) {
        const error = new VError('failed to retrieve user: %j', _.pick(query, 'id', 'uid', 'email'));

        log('error', error);

        return cb(error);
      }

      log('info', 'retrieved user %j', user);

      cb(null, {
        id: user.id,
        uid: user.uid,
        name: user.fullName,
        thumbnail: user.image ? imageBucketPath + user.image : null,
        email: user.email,
        culture: user.culture,
        isNew: !!user.isNew,
        isBlacklisted: user.isBlacklisted,
      });
    })
    .catch(err => {
      log('error', new VError(err, 'failed to retrieve user: %j', _.pick(query, 'id', 'uid', 'email')));
      cb(err, null);
    });
}

function load({ detailed, redirect, msg } = {}) {
  return (req, res, next) => {
    sessions.get(req, { detailed }, (err, user) => {
      if (err) return next(err);
      if (!user && redirect) {
        const redirectURL = Buffer.from(req.originalUrl, 'utf-8').toString('base64');
        return res.redirect(302, `${req.agenda ? `/${req.agenda.slug}` : ''}/signin?redirect=${redirectURL}&msg=${msg}`);
      }

      if (user && user.isBlacklisted) {
        sessions.setFlash(req, res, `
          <div class="text-center margin-top-sm">
            <strong>${getAuthMessageLabel('isBlacklisted', user.culture)}</strong>
            <p>${getAuthMessageLabel('isBlacklistedInfo', user.culture)}</p>
          </div>`);
        sessions.close(req, () => {
          res.redirect(302, '/');
        });
      } else {
        req.user = user;
        next();
      }
    });
  };
}

function loadOrRedirect(options) {
  return load({
    detailed: false,
    redirect: true,
    msg: 'authRequired',
    ...options,
  });
}

function requireSuperAdmin(config) {
  return (req, res, next) => {
    sessions.get(req, { detailed: true }, (err, session) => {
      if (err) return next(err);

      const { id } = session;

      if (config.superAdminIds.indexOf(parseInt(id, 10)) !== -1) {
        next();
      } else {
        sessions.setFlash(req, res, 'Ah Nononon. Nononon. Non.');

        res.redirect(302, '/');
      }
    });
  };
}

module.exports.init = (config, services) => {
  sessions.init({
    redisClient: services.redis,
    redis: {
      prefix: config.session.namespace,
    },
    sessionCookie: config.session,
    writableCookie: {
      maxAge: config.session.maxAge,
      name: config.session.writableName, // overriden by iso configuration
    },
    expire: config.session.maxAge / 1000,
    interfaces: {
      getUser: getUser.bind(null, services, config.aws.imageBucketPath),
    },
    logger: config.getLogConfig('oa', 'sessions', false),
  });

  Object.assign(service, sessions);

  service.mw.load = load;
  service.mw.loadOrRedirect = loadOrRedirect;
  service.mw.requireSuperAdmin = requireSuperAdmin(config);

  return service;
};
