'use strict';

const log = require('@openagenda/logs')('get');
const _ = require('lodash');
const { cleanSession, callbackify } = require('./helpers');

async function _getFromUid(config, uid) {
  const {
    redisClient,
  } = config;

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

module.exports = (config, uidOrRequest, o, c) => {
  const cb = c === undefined ? o : c;
  const options = c === undefined ? {} : o;

  callbackify(get(config, uidOrRequest, options), cb);
};

module.exports.promise = get;
