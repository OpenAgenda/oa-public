'use strict';

const { promisify } = require('util');
const log = require('@openagenda/logs')('CachedCount');

const PREFIX = 'agenda_events:CachedCount';
const defaultLifetime = 60*60*24;

module.exports = (redisClient, namespace, fn, lifetime) => {
  const expire = promisify(redisClient.expire.bind(redisClient));
  const decrby = promisify(redisClient.decrby.bind(redisClient));
  const incrby = promisify(redisClient.incrby.bind(redisClient));
  const get = promisify(redisClient.get.bind(redisClient));
  const set = promisify(redisClient.set.bind(redisClient));
  const getKey = args => `${PREFIX}:${namespace}:${args.join(':')}`;

  const getCurrentCount = async (args, forceReset = false) => {
    const key = getKey(args);
    const current = await get(key);
    let count = current;
    log('current', count);

    if (forceReset || (current === null)) {
      count = await fn.apply(null, args);
      await set(key, count);
      await expire(key, lifetime || defaultLifetime);
    }
    return typeof count === 'string' ? parseInt(count) : count;
  }

  return Object.assign((...args) => getCurrentCount(args), {
    inc: async (...args) => {
      log('inc');
      const count = args.pop();
      await getCurrentCount(args);
      return incrby(getKey(args), count);
    },
    dec: async (...args) => {
      log('dec');
      const count = args.pop();
      await getCurrentCount(args);
      return decrby(getKey(args), count);
    }
  })
}
