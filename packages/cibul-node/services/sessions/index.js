import Sessions from '@openagenda/sessions';
import load, { loadOrRedirect } from './lib/load.js';

export function init(config, services) {
  const sessions = Sessions({
    redisClient: services.redis,
    redis: {
      prefix: config.session.namespace,
    },
    sessionCookie: config.session,
    userCookie: {
      name: config.session.userCookieName,
      secure: config.session.secure,
      sameSite: config.session.sameSite,
    },
    expire: config.session.maxAge / 1000,
    cultures: config.interfaceLanguages,
    logger: config.getLogConfig('oa', 'sessions', false),
  });

  sessions.mw.load = load.bind(null, sessions, {
    imageBucketPath: config.s3.mainBucketPath,
  });
  sessions.mw.loadOrRedirect = loadOrRedirect.bind(null, sessions, {
    imageBucketPath: config.s3.mainBucketPath,
  });

  // BA's load middleware populates req.user globally before any route handler
  // (server.js), so these gates just need to check `req.user`.
  sessions.isLogged = async (req) => !!req?.user;
  sessions.mw.ifLogged = (fn) => (req, res, next) =>
    (req.user ? fn(req, res, next) : next());
  sessions.mw.ifUnlogged = (fn) => (req, res, next) =>
    (!req.user ? fn(req, res, next) : next());
  sessions.getCulture = (req) => req?.user?.culture ?? null;

  return sessions;
}
