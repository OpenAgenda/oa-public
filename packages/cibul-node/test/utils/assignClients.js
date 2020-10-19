'use strict';

const redis = require('redis');

module.exports = c => Object.assign(c, {
  redisClient: redis.createClient()
});
