"use strict";

const _ = require('lodash');
const redis = require('redis');

module.exports = c => {
  if (!c.redis && !c.client) {
    throw new Error('redis configuration is missing');
  };

  const prefix = c.prefix || 'simplecache:';
  const client = c.client || redis.createClient(c.redis.port, c.redis.host);

  return (namespace, identifier = null) => {
    const getRedisKey = key => [prefix + namespace].concat(
      identifier === null ? [] : [ identifier ]
    ).concat([key]).join(':');

    return {
      get: (key, cb) => client.get(getRedisKey(key), cb),
      set: set.bind(null, { client, getRedisKey })
    }
  }
}

function set({ client, getRedisKey }, key, value, ttl, cb) {
  client.set(getRedisKey(key), value, (err, result) => {
    if (err) return cb(err);

    client.expire(getRedisKey(key), ttl, err => {
      if (err) return cb(err);
      cb();
    });
  });
}
