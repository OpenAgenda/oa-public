'use strict';

const Sessions = require('@openagenda/sessions');
const getUser = require('./interfaces/getUser');
const load = require('./lib/load');
const requireSuperAdmin = require('./lib/requireSuperAdmin');

const { loadOrRedirect } = load;

module.exports.init = (config, services) => {
  const sessions = Sessions({
    redisClient: services.redis,
    redis: {
      prefix: config.session.namespace,
    },
    sessionCookie: config.session,
    writableCookie: {
      maxAge: config.session.maxAge,
      name: config.session.writableName, // overriden by iso configuration
    },
    userCookie: {
      name: config.session.userCookieName,
      secure: config.session.secure,
      sameSite: config.session.sameSite,
    },
    expire: config.session.maxAge / 1000,
    interfaces: {
      getUser: getUser.bind(null, services, config.aws.imageBucketPath),
    },
    cultures: config.interfaceLanguages,
    logger: config.getLogConfig('oa', 'sessions', false),
  });

  sessions.mw.load = load.bind(null, sessions);
  sessions.mw.loadOrRedirect = loadOrRedirect.bind(null, sessions);
  sessions.mw.requireSuperAdmin = requireSuperAdmin(sessions, config);

  return sessions;
};
