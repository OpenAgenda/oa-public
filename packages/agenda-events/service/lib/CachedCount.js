'use strict';

const { promisify } = require('util');
const log = require('@openagenda/logs')('CachedCount');

const PREFIX = 'agenda_events:CachedCount';
const defaultLifetime = 60*60*24;

module.exports = function CachedCount(redisClient, namespace, fn, lifetime) {
  const getKey = args => `${PREFIX}:${namespace}:${args.filter(e => !!e).join(':')}`;

  const getCurrentCount = async (args, forceReset = false) => {
    const key = getKey(args);
    const current = await redisClient.get(key);
    let count = current;
    log('current', count);

    if (forceReset || (current === null)) {
      count = await fn.apply(null, args);
      await redisClient.set(key, count);
      await redisClient.expire(key, lifetime || defaultLifetime);
    }
    return typeof count === 'string' ? parseInt(count) : count;
  }

  return Object.assign((...args) => getCurrentCount(args), {
    inc: async (...args) => {
      log('inc');
      const count = args.pop();
      await getCurrentCount(args);
      return redisClient.incrBy(getKey(args), count);
    },
    dec: async (...args) => {
      log('dec');
      const count = args.pop();
      await getCurrentCount(args);
      return redisClient.decrBy(getKey(args), count);
    }
  })
}
