import logger from '@openagenda/logs';
import _ from 'lodash';
import { cleanSession, callbackify } from './helpers/index.js';

const log = logger('get');

async function _getFromUid(config, uid) {
  const { redisClient } = config;

  const result = await redisClient.get([config.redis.prefix, uid].join(':'));

  if (!result) return null;

  try {
    return JSON.parse(result);
  } catch (e) {
    log('error', 'could not parse store for user %s: %s', uid, result);

    return null;
  }
}

async function _getFromRequest(config, request, options = {}) {
  const cookieUser = cleanSession(request.session).user;

  if (!cookieUser) return null;

  const stored = await _getFromUid(config, cookieUser.uid, options);

  if (!stored) return null;

  return _.extend(cookieUser, stored);
}

async function get(config, uidOrRequest, options = {}) {
  if (!(_.isObject(uidOrRequest) && uidOrRequest.cookies)) {
    return _getFromUid(config, uidOrRequest, options);
  }

  return _getFromRequest(config, uidOrRequest, options);
}

export default (config, uidOrRequest, o, c) => {
  const cb = c === undefined ? o : c;
  const options = c === undefined ? {} : o;

  callbackify(get(config, uidOrRequest, options), cb);
};

export { get as promise };
