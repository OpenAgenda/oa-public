import { cleanSession, callbackify } from './helpers/index.js';

function closeByUid(config, uid) {
  return config.redisClient.del([config.redis.prefix, uid].join(':'));
}

async function close(config, request) {
  const { user: cookieUser, sessionId } = cleanSession(request.session);

  if (cookieUser) {
    await closeByUid(config, cookieUser.uid);
  }

  request.session = sessionId ? { sessionId } : null;

  return {
    success: true,
  };
}

export default (config, request, cb) => {
  callbackify(close(config, request), cb);
};

export { closeByUid as byUid };
