'use strict';

const redis = require('redis');

module.exports = c => {
  if (!c.redis && !c.client) {
    throw new Error('redis configuration is missing');
  }

  const prefix = c.prefix || 'simplecache:';
  const client = c.client || redis.createClient(c.redis.port, c.redis.host);

  return (namespace, identifier = null) => {
    const getRedisKey = key => [prefix + namespace].concat(
      identifier === null ? [] : [identifier]
    ).concat([key]).join(':');

    return {
      get: (key, cb) => client.get(getRedisKey(key), cb),
      set: (key, value, ttl, cb) => client.set(getRedisKey(key), value, 'ex', ttl, cb),
      ttl: (key, cb) => client.ttl(getRedisKey(key), cb)
    };
  };
};
