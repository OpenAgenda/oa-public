import Sessions from '@openagenda/sessions';
import getUser from './interfaces/getUser.js';
import load, { loadOrRedirect } from './lib/load.js';

export function init(config, services) {
  const sessions = Sessions({
    redisClient: services.redis.ioRedis,
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

  sessions.mw.load = load.bind(null, sessions);
  sessions.mw.loadOrRedirect = loadOrRedirect.bind(null, sessions);

  return sessions;
}
