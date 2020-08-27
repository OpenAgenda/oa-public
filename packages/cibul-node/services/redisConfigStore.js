'use strict';

const { promisify } = require('util');
const log = require('@openagenda/logs')('services/redisConfigStore');

async function get(client, prefix, key, options = {}) {
  const {
    defaultValue,
    throwOnError
  } = {
    defaultValue: null,
    throwOnError: true,
    ...options
  };

  const redisGet = promisify(client.get).bind(client);

  try {
    const value = await redisGet(prefix + key);
    log('got: %s -> %s', prefix + key, value)
    if (value === null) {
      return defaultValue;
    } else {
      return value;
    }
  } catch (e) {
    if (throwOnError) {
      throw e;
    } else {
      log('error', e);
      return defaultValue;
    }
  }
}

async function set(client, prefix, key, value, options = {}) {
  const {
    throwOnError
  } = {
    throwOnError: true,
    ...options
  };

  const redisSet = promisify(client.set).bind(client);

  try {
    await redisSet(prefix + key, value);
    log('set: %s <- %s', prefix + key, value);
  } catch (e) {
    if (throwOnError) {
      throw e;
    } else {
      log('error', e);
    }
  }
}


module.exports.init = (config, services) => {
  const prefix = 'configstore:';
  return Object.assign(get.bind(null, config.redisClient, prefix), {
    set: set.bind(null, config.redisClient, prefix)
  });
}
