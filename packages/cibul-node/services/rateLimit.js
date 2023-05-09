'use strict';

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

function RateLimit(_config, services) {
  const {
    redis,
  } = services;

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    resetExpiryOnChange: true,
    store: new RedisStore({
      sendCommand: (...args) => redis.sendCommand(args),
    }),
  });

  return limiter;
}

module.exports.init = (config, services) => RateLimit(config, services);
