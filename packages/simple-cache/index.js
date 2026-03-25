import logger from '@openagenda/logs';
import VError from '@openagenda/verror';

const log = logger('index');

const stringifyKey = (keyObj) =>
  JSON.stringify(
    Object.keys(keyObj || {})
      .sort()
      .reduce(
        (sorted, key) => Object.assign(sorted, { [key]: keyObj[key] }),
        {},
      ),
  );

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

const getValueKey = (key = '') =>
  (key instanceof Object ? stringifyKey(key) : key);

async function get(svc, namespace, identifier, key) {
  const { client, prefix } = svc;
  const redisKey = getRedisKey(prefix, namespace, identifier, key);

  log('getting on %s', redisKey);

  return client.get(redisKey);
}

async function set(svc, namespace, identifier, ...args) {
  const { client, prefix } = svc;

  const key = args.length === 3 ? args.shift() : '';
  const [value, ttlValue] = args;

  const redisKey = getRedisKey(prefix, namespace, identifier, key);

  try {
    await client.set(
      redisKey,
      value instanceof Object ? JSON.stringify(value) : value,
      'EX',
      ttlValue,
    );
    return value;
  } catch (e) {
    throw new VError({
      cause: e,
      info: {
        namespace,
        identifier,
        key,
        ttlValue,
        value,
      },
    });
  }
}

async function hget(svc, namespace, identifier, key, options = {}) {
  const { client, prefix } = svc;
  const { json = false } = options;

  const hash = getHashKey(prefix, namespace, identifier);
  const valueKey = getValueKey(key);

  log('getting on hash %s, key %s', hash, valueKey);

  const value = await client.hget(hash, `${valueKey}`);
  log('got %s', value ? 'something' : 'nothing');

  if (!json) return value;

  try {
    return value ? JSON.parse(value) : value;
  } catch (e) {
    log('failed to parse JSON at hash %s, key %s: %s', hash, valueKey, value);
  }

  return null;
}

async function hset(svc, namespace, identifier, ...args) {
  const { client, prefix } = svc;

  const key = args.length === 2 ? args.shift() : '';
  const value = args[0];

  const hash = getHashKey(prefix, namespace, identifier);
  const valueKey = getValueKey(key);

  log('setting on hash %s, key %s', hash, valueKey);

  try {
    await client.hset(
      hash,
      valueKey,
      value instanceof Object ? JSON.stringify(value) : value,
    );
    return value;
  } catch (e) {
    throw new VError({
      cause: e,
      info: {
        prefix,
        namespace,
        identifier,
        key,
        value,
      },
    });
  }
}

async function ttl(svc, namespace, identifier, key) {
  const { client, prefix } = svc;
  const redisKey = getRedisKey(prefix, namespace, identifier, key);

  return client.ttl(redisKey);
}

async function del(svc, namespace, identifier) {
  const { client, prefix } = svc;
  const hashKey = getHashKey(prefix, namespace, identifier);

  await client.del(hashKey);
}

async function expire(svc, namespace, identifier, expireInSeconds) {
  const { client, prefix } = svc;
  const hash = getHashKey(prefix, namespace, identifier);

  log('setting expire on hash %s', hash);

  await client.hset(hash, '', '');
  await client.expire(hash, expireInSeconds);
}

async function hashReset(svc, namespace, identifier, expireInSeconds) {
  const { client, prefix } = svc;
  const hash = getHashKey(prefix, namespace, identifier);

  log('resetting on hash %s', hash);

  await client.del(hash);
  await client.hset(hash, '', '');
  await client.expire(hash, expireInSeconds);
}

async function clearAll(svc) {
  const { client, prefix } = svc;

  let count = 0;
  for (const key of await client.keys(`${prefix}:*`)) {
    try {
      await client.del(key);
      count += 1;
    } catch (e) {
      /* */
    }
  }

  log('cleared all %s stored items', count);
}

export default (c) => {
  if (!c.client) {
    throw new Error('redis client is missing');
  }

  const prefix = c.prefix || 'simplecache:';
  const { client } = c;

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  return Object.assign(
    (namespace, identifier = null) => ({
      get: get.bind(null, { client, prefix }, namespace, identifier),
      set: set.bind(null, { client, prefix }, namespace, identifier),
      ttl: ttl.bind(null, { client, prefix }, namespace, identifier),
      del: del.bind(null, { client, prefix }, namespace, identifier),
    }),
    {
      hash: (namespace, identifier = null) => ({
        get: hget.bind(null, { client, prefix }, namespace, identifier),
        set: hset.bind(null, { client, prefix }, namespace, identifier),
        del: del.bind(null, { client, prefix }, namespace, identifier),
        expire: expire.bind(null, { client, prefix }, namespace, identifier),
        reset: hashReset.bind(null, { client, prefix }, namespace, identifier),
      }),
      clearAll: clearAll.bind(null, { client, prefix }),
    },
  );
};
