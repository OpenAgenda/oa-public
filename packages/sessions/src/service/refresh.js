'use strict';

const logger = require('@openagenda/logs');

const {
  getUser,
  generateSessionUser,
} = require('./helpers');

const log = logger('refresh');

module.exports = async (config, identifier) => {
  const {
    redisClient,
    interfaces,
  } = config;

  const sessionKey = [config.redis.prefix, identifier].join(':');

  log('refreshing session for key %s', sessionKey);

  if (!await redisClient.get(sessionKey)) {
    return null;
  }

  const user = await getUser(interfaces, { uid: identifier });

  log('fetched user %j', user);

  const {
    sessionUser,
  } = generateSessionUser(config, user);

  log('generated %j', sessionUser);

  await config.redisClient.set(sessionKey, JSON.stringify(sessionUser));
};
