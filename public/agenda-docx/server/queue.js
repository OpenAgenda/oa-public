'use strict';

const { promisify } = require('util');
const _ = require('lodash');
const redis = require('redis');
const VError = require('verror');

const clients = {};

let config;

function _queueName() {
  // docx:queue
  return `${config.namespace + (config.separator || ':')}queue`;
}

// function _closeRedisClient(name = 'default') {
//   clients[name] = null;
// }

function _promisifyRedisClient(client, methods) {
  client.p = methods.reduce((promised, method) => {
    promised[method] = promisify(client[method].bind(client));

    return promised;
  }, {});
}

function _getRedisClient(name = 'default') {
  return new Promise((rs, rj) => {
    let responded = false;

    function _respond(err) {
      if (responded) return;

      responded = true;

      if (err) clients[name] = null;

      return err ? rj(err) : rs(clients[name]);
    }

    if (clients[name]) return _respond(null, clients[name]);

    if (!config) {
      return _respond(new Error('redis config is missing'));
    }

    clients[name] = redis.createClient(config.redis.port, config.redis.host);

    _promisifyRedisClient(clients[name], [
      'get',
      'set',
      'llen',
      'rpush',
      'lpop',
      'blpop',
      'del',
    ]);

    clients[name].on('error', _respond);

    clients[name].on('ready', () => {
      _respond(null, clients[name]);
    });
  });
}

async function clear() {
  const client = await _getRedisClient();

  return client.p.del(_queueName());
}

async function total() {
  const client = await _getRedisClient();

  return client.p.llen(_queueName());
}

function waitAndPop() {
  return _getRedisClient('task').then(
    client => new Promise((rs, rj) => {
      client.blpop(_queueName(), 0, (err, result) => {
        if (err) return rj(err);

        rs(JSON.parse(result[1]));
      });
    })
  );
}

async function enqueue(data) {
  const client = await _getRedisClient();

  return client.p.rpush(_queueName(), JSON.stringify(data));
}

async function pop() {
  const client = await _getRedisClient();

  const popped = await client.p.lpop(_queueName());

  return popped ? JSON.parse(popped) : null;
}

async function init(c) {
  config = c;

  try {
    await _getRedisClient();
  } catch (e) {
    throw new VError(e, 'oa-docx init - Could not connect to redis');
  }
}

module.exports = _.extend(enqueue, {
  pop,
  waitAndPop,
  total,
  clear,
  init,
});
