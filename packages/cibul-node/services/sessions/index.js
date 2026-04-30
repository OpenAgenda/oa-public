import Sessions from '@openagenda/sessions';
import getUser from './interfaces/getUser.js';
import load, { loadOrRedirect } from './lib/load.js';

export function init(config, services) {
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
      getUser: getUser.bind(null, services, config.s3.mainBucketPath),
    },
    cultures: config.interfaceLanguages,
    logger: config.getLogConfig('oa', 'sessions', false),
  });

  sessions.mw.load = load.bind(null, sessions, {
    imageBucketPath: config.s3.mainBucketPath,
  });
  sessions.mw.loadOrRedirect = loadOrRedirect.bind(null, sessions, {
    imageBucketPath: config.s3.mainBucketPath,
  });

  // isLogged / ifLogged / ifUnlogged read req.user (set by sessions.mw.load
  // above) instead of the legacy cookie-session check, which doesn't know
  // about better-auth sessions. mw.load runs globally before any route
  // (server.js), so req.user is reliably populated by the time these gates
  // run in route preMw chains.
  const legacyIsLogged = sessions.isLogged;
  sessions.isLogged = async (req) => {
    if (req?.user) return true;
    return legacyIsLogged(req);
  };
  sessions.mw.ifLogged = (fn) => (req, res, next) => {
    if (req.user) return fn(req, res, next);
    return next();
  };
  sessions.mw.ifUnlogged = (fn) => (req, res, next) => {
    if (!req.user) return fn(req, res, next);
    return next();
  };

  return sessions;
}
