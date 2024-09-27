'use strict';

const config = require('../config');

function _key(key) {
  return [config.redis.prefix, key].join(':');
}

function set(key, value) {
  return config.redis.client.set(_key(key), value, 'EX', config.cache.duration);
}

function get(key) {
  return config.redis.client.get(_key(key));
}

module.exports = {
  set,
  get,
};
