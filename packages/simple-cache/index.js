'use strict';

const redis = require('redis');
const logger = require('@openagenda/logs');

const log = logger('index');

const stringifyKey = keyObj => JSON.stringify(
  Object.keys(keyObj || {})
    .sort()
    .reduce((sorted, key) => Object.assign(sorted, { [key]: keyObj[key] }), {})
);

function reject(rj, cb, err) {
  if (cb) cb(err);
  rj(err);
}
function resolve(rs, cb, value) {
  if (cb) cb(null, value);
  rs(value);
}

function rejectOrResolve(rs, rj, cb, err, value) {
  if (err) {
    return reject(rj, cb, err);
  }
  resolve(rs, cb, value);
}

const getHashKey = (prefix, namespace, identifier = null) => {
  const parts = [prefix, namespace];

  if (identifier) {
    parts.push(identifier);
  }

  return parts.join(':');
};

const getRedisKey = (prefix, namespace, identifier = null, key = null) => {
  const parts = [prefix, namespace];

  if (identifier) {
    parts.push(identifier);
  }

  if (key) {
    parts.push(key instanceof Object ? stringifyKey(key) : key);
  }

  return parts.join(':');
};

const getValueKey = (key = '') => (key instanceof Object ? stringifyKey(key) : key);

function get(...args) {
  const cb = typeof (args[args.length - 1]) === 'function' ? args.pop() : null;
  const [svc, namespace, identifier, key] = args;
  const {
    client,
    prefix
  } = svc;

  const redisKey = getRedisKey(prefix, namespace, identifier, key);

  log('getting on %s', redisKey);

  return new Promise((rs, rj) => {
    client.get(redisKey, (err, value) => {
      log('got %s', value ? 'something' : 'nothing');
      rejectOrResolve(rs, rj, cb, err, value);
    });
  });
}

function set(...args) {
  const cb = typeof (args[args.length - 1]) === 'function' ? args.pop() : null;
  const [svc, namespace, identifier] = args;

  const key = args.length === 6 ? args[3] : '';
  const ttlValue = args.pop();
  const value = args.pop();

  const {
    client,
    prefix
  } = svc;

  const redisKey = getRedisKey(prefix, namespace, identifier, key);

  return new Promise((rs, rj) => {
    client.set(redisKey, value, 'ex', ttlValue, err => {
      rejectOrResolve(rs, rj, cb, err, value);
    });
  });
}

function hget(...args) {
  const options = typeof (args[args.length - 1]) === 'object' ? args.pop() : {};
  const [svc, namespace, identifier, key] = args;
  const {
    client,
    prefix
  } = svc;

  const {
    json = false
  } = options;

  const hash = getHashKey(prefix, namespace, identifier);
  const valueKey = getValueKey(key);

  log('getting on hash %s, key %s', hash, valueKey);

  return new Promise((rs, rj) => {
    client.hget(hash, valueKey, (err, value) => {
      log('got %s', value ? 'something' : 'nothing');
      if (err) return rj(err);
      if (!json) return rs(value);

      try {
        return rs(value ? JSON.parse(value) : value);
      } catch (e) {
        log('failed to parse JSON at hash %s, key %s: %s', hash, valueKey, value);
      }

      return rs(null);
    });
  });
}

function hset(...args) {
  const cb = typeof (args[args.length - 1]) === 'function' ? args.pop() : null;
  const [svc, namespace, identifier] = args;

  const key = args.length === 5 ? args[3] : '';
  const value = args.pop();

  const {
    client,
    prefix
  } = svc;

  const hash = getHashKey(prefix, namespace, identifier);
  const valueKey = getValueKey(key);

  log('setting on hash %s, key %s', hash, valueKey);

  return new Promise((rs, rj) => {
    client.hset(hash, valueKey, value instanceof Object ? JSON.stringify(value) : value, err => {
      rejectOrResolve(rs, rj, cb, err, value);
    });
  });
}

function ttl(svc, namespace, identifier, key, cb) {
  const {
    client,
    prefix
  } = svc;

  const redisKey = getRedisKey(prefix, namespace, identifier, key);

  return new Promise((rs, rj) => {
    client.ttl(redisKey, (err, value) => {
      rejectOrResolve(rs, rj, cb, err, value);
    });
  });
}

function del(svc, namespace, identifier, cb) {
  const {
    client,
    prefix
  } = svc;

  const hashKey = getHashKey(prefix, namespace, identifier);

  return new Promise((rs, rj) => {
    client.del(hashKey, (err, value) => {
      rejectOrResolve(rs, rj, cb, err, value);
    });
  });
}

function hashReset(svc, namespace, identifier, expire, cb) {
  const {
    client,
    prefix
  } = svc;

  const hash = getHashKey(prefix, namespace, identifier);

  return new Promise((rs, rj) => {
    client.del(hash, err1 => {
      if (err1) {
        return reject(rj, cb, err1);
      }

      // set a random value to initialize hash expiry
      client.hset(hash, '', '', err2 => {
        if (err2) {
          return reject(rj, cb, err2);
        }

        client.expire(hash, expire, err3 => {
          if (err3) {
            return reject(rj, cb, err3);
          }
          resolve(rs, cb);
        });
      });
    });
  });
}

async function clearAll(svc) {
  const {
    client,
    prefix
  } = svc;

  return new Promise((rs, rj) => {
    client.keys(`${prefix}:*`, (err, keys) => {
      if (err) return rj(err);

      Promise.all(keys.map(key => new Promise((rs2, rj2) => {
        client.del(key, (err2, value) => {
          if (err) return rj2(err2);
          rs2(value);
        });
      }))).then(results => {
        log('cleared all %s stored items', results.length);
        rs();
      });
    });
  });
}

module.exports = c => {
  if (!c.redis && !c.client) {
    throw new Error('redis configuration is missing');
  }

  const prefix = c.prefix || 'simplecache:';
  const client = c.client || redis.createClient(c.redis.port, c.redis.host);

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  return Object.assign((namespace, identifier = null) => ({
    get: get.bind(null, { client, prefix }, namespace, identifier),
    set: set.bind(null, { client, prefix }, namespace, identifier),
    ttl: ttl.bind(null, { client, prefix }, namespace, identifier),
    del: del.bind(null, { client, prefix }, namespace, identifier)
  }), {
    hash: (namespace, identifier = null) => ({
      get: hget.bind(null, { client, prefix }, namespace, identifier),
      set: hset.bind(null, { client, prefix }, namespace, identifier),
      del: del.bind(null, { client, prefix }, namespace, identifier),
      reset: hashReset.bind(null, { client, prefix }, namespace, identifier)
    }),
    clearAll: clearAll.bind(null, { client, prefix })
  });
};
