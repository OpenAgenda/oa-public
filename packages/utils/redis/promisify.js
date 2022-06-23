'use strict';

const { promisify } = require('util');

module.exports = redis => [
  'set',
  'get',
  'blpop',
  'lpop',
  'rpush',
  'llen',
  'lpush',
  'del',
  'quit',
  'keys'
].reduce((promisified, method) => Object.assign(
  promisified,
  { [method]: promisify(redis[method]).bind(redis) }
), {
  duplicate: redis.duplicate.bind(redis),
});
