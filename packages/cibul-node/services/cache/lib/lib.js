'use strict';

let cli;

const redis = require('redis');

const utils = require('../../../lib/utils');

module.exports = {
  enabled,
  get,
  load,
  getCli,
  init,
};

function init(config, services) {
  if (!config.useCache) return;

  cli = services.redis;
}

function getCli() {
  return cli;
}

function get(key, subKey, cb) {
  if (arguments.length === 3) {
    cli.hGet(key, subKey)
      .then(r => onResponse(null, r), onResponse);
  } else {
    cb = subKey;

    cli.get(key)
      .then(r => onResponse(null, r), onResponse);
  }

  function onResponse(err, data) {
    let cachedData;

    try {
      cachedData = JSON.parse(data);
    } catch (e) {
      cb('Invalid cached data');

      return;
    }

    cb(null, cachedData);
  }
}

function load(keys, method, expire, args, cb) {
  var args = Array.prototype.slice.call(arguments);

  var cb = args.pop();

  args.splice(0, 3);

  args.push((err, data) => {
    if (err || data === undefined || data === null) {
      // redis does not take those.
      return cb(err, data);
    }

    if (utils.isArray(keys)) {
      cli.hSet(keys[0], keys[1], JSON.stringify(data))
        .then(r => onRedisResponse(null, r), onRedisResponse);
    } else {
      cli.set(keys, JSON.stringify(data))
        .then(r => onRedisResponse(null, r), onRedisResponse);
    }

    function onRedisResponse(err, result) {
      // if expire is set, define it here
      if (expire) cli.expire(utils.isArray(keys) ? keys[0] : keys, parseInt(Math.ceil(expire / 1000), 10));

      if (err) return cb(err);

      cb(null, data);
    }
  });

  method.apply(null, args);
}

function enabled() {
  return !!cli;
}
