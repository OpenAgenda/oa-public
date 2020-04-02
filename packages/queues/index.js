'use strict';

const _ = require('lodash');
const redis = require('redis');
const { promisify } = require('util');
const VError = require('verror');

const v2 = require('./v2');

const clients = {};

const config = {};

module.exports = _.assign(queue, { init, v2 });

function queue(name) {
  const queueName = _getQueueName(name);

  return _.assign(enqueue.bind(null, queueName), {
    pop: pop.bind(null, queueName),
    waitAndPop: waitAndPop.bind(null, queueName),
    total: total.bind(null, queueName),
    clear: clear.bind(null, queueName)
  });
}

async function clear(queueName) {
  const client = await _getRedisClient();

  return client.p.del(queueName);
}

function _getQueueName(queueName) {
  if (!config.prefix)
    throw new Error('a prefix must be defined for redis queues');

  return [config.prefix, queueName].join(config.separator);
}

async function total(queueName) {
  const client = await _getRedisClient();

  return client.p.llen(queueName);
}

function waitAndPop(queueName) {
  return _getRedisClient(`task:${queueName}`).then(client => {
    return new Promise((rs, rj) => {
      client.blpop(queueName, 0, (err, result) => {
        if (err) return rj(err);

        rs(JSON.parse(result[1]));
      });
    });
  });
}

async function enqueue(queueName, data) {
  const client = await _getRedisClient();

  return client.p.rpush(queueName, JSON.stringify(data));
}

async function pop(queueName) {
  const client = await _getRedisClient();

  const popped = await client.p.lpop(queueName);

  return popped ? JSON.parse(popped) : null;
}

async function init(c) {
  _.assign(
    config,
    {
      prefix: 'queues',
      separator: ':',
      redis: { host: 'localhost', port: 6379 }
    },
    c
  );

  try {
    await _getRedisClient();
  } catch (e) {
    throw new VError(e, 'queues init - Could not connect to redis');
  }
}

function _getRedisClient(name = 'default') {
  return new Promise((rs, rj) => {
    let responded = false;

    function _respond(err) {
      if (responded) return;

      responded = true;

      if (err) clients[name] = null;

      err ? rj(err) : rs(clients[name]);
    }

    if (clients[name]) return _respond(null, clients[name]);

    if (!config) {
      return _respond(new Exception('redis config is missing'));
    }

    clients[name] = redis.createClient(config.redis.port, config.redis.host);

    _promisifyRedisClient(clients[name], [
      'get',
      'set',
      'llen',
      'rpush',
      'lpop',
      'blpop',
      'del'
    ]);

    clients[name].on('error', _respond);

    clients[name].on('ready', () => {
      _respond(null, clients[name]);
    });
  });
}

function _closeRedisClient(name = 'default') {
  clients[name] = null;
}

function _promisifyRedisClient(client, methods) {
  client.p = methods.reduce((promised, method) => {
    promised[method] = promisify(client[method].bind(client));

    return promised;
  }, {});
}
