'use strict';

const {
  getUser,
  generateSessionUser,
} = require('./helpers');

module.exports = async (config, identifier) => {
  const {
    redisClient,
    interfaces,
  } = config;

  const sessionKey = [config.redis.prefix, identifier].join(':');

  if (!await redisClient.get(sessionKey)) {
    return null;
  }

  const { sessionUser } = generateSessionUser(config, await getUser(interfaces, identifier));

  await config.redisClient.set(sessionKey, JSON.stringify(sessionUser));
};
