import { randomBytes } from 'node:crypto';
import logger from '@openagenda/logs';
import VError from '@openagenda/verror';
import cookieValidate from '../iso/cookie.validate.js';
import expressCookie from './expressCookie.js';
import {
  cleanSession,
  callbackify,
  getUser,
  generateSessionUser,
} from './helpers/index.js';

const log = logger('sessions/open');

function extractArgs(config, request, response, identifier, cb) {
  if (!cb) {
    return {
      config,
      request,
      response: null,
      identifier: response,
      cb: identifier,
    };
  }

  return {
    config,
    request,
    response,
    identifier,
    cb,
  };
}

async function open(config, request, response, identifier) {
  const { interfaces } = config;

  log('attempting session open for user %j', identifier);

  const user = await getUser(interfaces, identifier);

  let cookieData = null;

  if (!user) {
    log(
      'info',
      'no user matching user was found for identifier %j',
      identifier,
    );

    return {
      success: false,
      errors: [{ code: 'user.notfound' }],
    };
  }

  // load clean user session data
  const { sessionUser, expires, errors } = generateSessionUser(config, user);

  if (errors.length) {
    log('error', 'user validation failed on %j', user, errors);
    return { errors, success: false };
  }

  // store session in redis
  try {
    const sessionKey = [config.redis.prefix, sessionUser.uid].join(':');

    await config.redisClient.set(sessionKey, JSON.stringify(sessionUser));
    await config.redisClient.expire(sessionKey, config.expire);
  } catch (e) {
    log('error', 'session could not be stored in redis for user %s', user);

    throw new VError(
      e,
      'sessions could not be stored in redis for user %j',
      user,
    );
  }

  // store session in cookie

  console.log('KEEP', request.session.sessionId);

  cookieData = cookieValidate({
    user: sessionUser,
    sessionId: request.session.sessionId || randomBytes(12).toString('hex'),
    expires,
  });

  cleanSession(request.session, cookieData);

  // clear writable cookie
  if (response) {
    expressCookie(config, request, response).clear();
  }

  log('info', 'session opened', {
    uid: user.uid,
    email: user.email,
  });

  return {
    success: true,
    data: sessionUser,
    cookieData,
    errors: [],
  };
}

export default (cf, rq, rs, id, c) => {
  const { config, request, response, identifier, cb } = extractArgs(
    cf,
    rq,
    rs,
    id,
    c,
  );

  callbackify(open(config, request, response, identifier), cb);
};

export { open as promise };
