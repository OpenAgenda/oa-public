'use strict';

const STOP = 'STOPSIGNAL';
const logs = require('@openagenda/logs');

const log = logs('index');

const promisifyRedis = require('./utils/promisifyRedis');

module.exports = function({ redis, prefix, logger }) {
  if (logger) {
    logs.setModuleConfig(logger);
  }
  
  return name => Queue(redis, [prefix + name].join(''));
}

function Queue(redis, queueName, methods = {}, options = {}) {
  const refs = methods;
  const ons = {};
  const uniqueProcessId = Math.ceil(Math.random()*99999999);

  let taskRedisCli = null;

  const pRedis = promisifyRedis(redis);

  const queueMethods = Object.assign(queue.bind(null, pRedis, queueName), {
    run: () => {
      log('%s (%s): run', queueName, uniqueProcessId);
      taskRedisCli = run(redis, queueName, uniqueProcessId, methods, ons);
    },
    register: methods => {
      log('%s (%s): registering methods %s', queueName, uniqueProcessId, Object.keys(methods).join(', '));
      Object.assign(refs, methods)
    }
  });

  queueMethods.stop = async (options = {}) => {
    if (!taskRedisCli) return;
    log('%s (%s): stopping', queueName, uniqueProcessId);
    await pRedis.lpush(queueName, STOP);
    taskRedisCli = null;

    if (options.clear) {
      await queueMethods.clear();
    }
  
    if (options.remove) {
      log('%s (%s): unreferencing methods %s', queueName, uniqueProcessId, Object.keys(methods).join(', '));
      Object.keys(methods).forEach(methodName => {
        delete methods[methodName];
      });  
    }
    log('%s (%s): stopped', queueName, uniqueProcessId);
  };

  queueMethods.on = (name, fn) => {
    ons[name] = fn;
    return queueMethods;
  };

  queueMethods.clear = () => pRedis.del(queueName);

  return queueMethods;
}

function queue(pRedis, queueName, method, ...args) {
  return pRedis.rpush(queueName, JSON.stringify({ method, args }));
}

async function blpop(pRedis, queueName, uniqueProcessId) {
  log('%s (%s): waiting for next pop', queueName, uniqueProcessId);
  const next = await pRedis.blpop(queueName, 0)
  log('%s (%s): blpopped', queueName, uniqueProcessId);
  return next;
}

function run(redis, queueName, uniqueProcessId, methods, ons = {}) {
  const pRedis = promisifyRedis(redis.duplicate());

  (async () => {
    let blPopResult;

    while (blPopResult = await blpop(pRedis, queueName, uniqueProcessId)) {
      if (blPopResult[1] === STOP) {
        stop();
        break;
      }

      let result = null;
      let methodName = null;
      let args = null;

      try {
        const popped = JSON.parse(blPopResult[1]);
        methodName = popped.method;
        args = popped.args;

        if (!methods[methodName]) {
          log('%s(%s): Unregistered method %s', queueName, uniqueProcessId, methodName);
          throw new Error(`Unregistered method: ${methodName}`);
        }

        if (ons.execute) {
          try {
            ons.execute(methodName, args);
          } catch(e) {}
        }

        result = await methods[methodName].apply(null, args);
      } catch (e) {
        if (ons.error) {
          try {
            ons.error(methodName, args, e);
          } catch (e) {}
        }
      }

      if (ons.success) {
        try {
          ons.success(methodName, args, result);
        } catch (e) {}
      }
    }
    log('%s (%s): exiting run subloop', queueName, uniqueProcessId);
  })();

  async function stop() {
    log('%s (%s): quitting queue', queueName, uniqueProcessId);
    await pRedis.quit();
    try {
      ons.finish ? ons.finish() : null;
    } catch (e) {}
  }

  return pRedis;
}
