'use strict';

const redis = require('redis');
const logger = require('@openagenda/logs');

const log = logger('index');

const stringifyKey = keyObj => JSON.stringify(
  Object.keys(keyObj || {})
    .sort()
    .reduce((sorted, key) => Object.assign(sorted, { [key]: keyObj[key] }), {}),
);

const resolve = (v, cb) => {
  if (cb) {
    cb(null, v);
  } else {
    return v;
  }
};

const reject = (e, cb) => {
  if (cb) {
    cb(e);
  } else {
    throw e;
  }
};

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
  const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
  const [svc, namespace, identifier, key] = args;
  const {
    client,
    prefix,
  } = svc;

  const redisKey = getRedisKey(prefix, namespace, identifier, key);

  log('getting on %s', redisKey);

  return client.get(redisKey).then(v => resolve(v, cb), e => reject(e, cb));
}

function set(...args) {
  const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
  const [svc, namespace, identifier] = args;

  const key = args.length === 6 ? args[3] : '';
  const ttlValue = args.pop();
  const value = args.pop();

  const {
    client,
    prefix,
  } = svc;

  const redisKey = getRedisKey(prefix, namespace, identifier, key);

  return client.set(redisKey, value instanceof Object ? JSON.stringify(value) : value, {
    EX: `${ttlValue}`,
  }).then(() => resolve(value, cb), e => reject(e, cb));
}

async function hget(...args) {
  const options = typeof args[args.length - 1] === 'object' ? args.pop() : {};
  const [svc, namespace, identifier, key] = args;
  const {
    client,
    prefix,
  } = svc;

  const {
    json = false,
  } = options;

  const hash = getHashKey(prefix, namespace, identifier);
  const valueKey = getValueKey(key);

  log('getting on hash %s, key %s', hash, valueKey);

  const value = await client.hGet(hash, `${valueKey}`);
  log('got %s', value ? 'something' : 'nothing');

  if (!json) return value;

  try {
    return value ? JSON.parse(value) : value;
  } catch (e) {
    log('failed to parse JSON at hash %s, key %s: %s', hash, valueKey, value);
  }

  return null;
}

function hset(...args) {
  const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
  const [svc, namespace, identifier] = args;

  const key = args.length === 5 ? args[3] : '';
  const value = args.pop();

  const {
    client,
    prefix,
  } = svc;

  const hash = getHashKey(prefix, namespace, identifier);
  const valueKey = getValueKey(key);

  log('setting on hash %s, key %s', hash, valueKey);

  return client
    .hSet(hash, valueKey, value instanceof Object ? JSON.stringify(value) : value)
    .then(() => resolve(value, cb), e => reject(e, cb));
}

function ttl(svc, namespace, identifier, key, cb) {
  const {
    client,
    prefix,
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
    prefix,
  } = svc;

  const hashKey = getHashKey(prefix, namespace, identifier);

  return client.del(hashKey).then(() => resolve(null, cb), e => reject(e, cb));
}

async function hashReset(svc, namespace, identifier, expire, cb) {
  const {
    client,
    prefix,
  } = svc;

  const hash = getHashKey(prefix, namespace, identifier);

  try {
    await client.del(hash);
    await client.hSet(hash, '', '');
    await client.expire(hash, expire);
  } catch (e) {
    return reject(e, cb);
  }

  return resolve(null, cb);
}

async function clearAll(svc) {
  const {
    client,
    prefix,
  } = svc;

  let count = 0;
  for (const key of await client.keys(`${prefix}:*`)) {
    try {
      await client.del(key);
      count += 1;
    } catch (e) { /* */ }
  }

  log('cleared all %s stored items', count);
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
    del: del.bind(null, { client, prefix }, namespace, identifier),
  }), {
    hash: (namespace, identifier = null) => ({
      get: hget.bind(null, { client, prefix }, namespace, identifier),
      set: hset.bind(null, { client, prefix }, namespace, identifier),
      del: del.bind(null, { client, prefix }, namespace, identifier),
      reset: hashReset.bind(null, { client, prefix }, namespace, identifier),
    }),
    clearAll: clearAll.bind(null, { client, prefix }),
  });
};
