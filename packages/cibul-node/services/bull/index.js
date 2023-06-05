/* eslint-disable max-classes-per-file */

'use strict';

const bullmq = require('bullmq');
const IORedis = require('ioredis');

const log = require('@openagenda/logs')('services/bull');

function createRedisConnection(config) {
  if (config.redis.clusterMode) {
    return new IORedis.Cluster(config.redis.nodes, {
      redisOptions: {
        password: config.redis.password,
        maxRetriesPerRequest: null,
      },
    });
  }

  return new IORedis({
    port: config.redis.port,
    host: config.redis.host,
    maxRetriesPerRequest: null,
  });
}

function checkPrefixOption(opts) {
  if (!opts.prefix?.match(/\{.+\}/)) {
    console.warn([
      'BullMQ: WARNING! Your option prefix must be defined with a redis cluster hash tag.',
      'See more at https://docs.bullmq.io/bull/patterns/redis-cluster',
    ].join(' '));
  }
}

module.exports.init = (config, _services) => {
  log('init');

  const connection = createRedisConnection(config);

  class Queue extends bullmq.Queue {
    constructor(name, opts, con) {
      checkPrefixOption(opts);
      super(name, { connection, ...opts }, con);
    }
  }

  class Worker extends bullmq.Worker {
    constructor(name, processor, opts, con) {
      checkPrefixOption(opts);
      super(name, processor, { connection, ...opts }, con);
    }
  }

  class QueueEvents extends bullmq.QueueEvents {
    constructor(name, opts, con) {
      checkPrefixOption(opts);
      super(name, { connection, ...opts }, con);
    }
  }

  class FlowProducer extends bullmq.FlowProducer {
    constructor(opts, con) {
      checkPrefixOption(opts);
      super({ connection, ...opts }, con);
    }
  }

  // const myQueue = new Queue('renovate');
  //
  // const worker = new Worker('renovate', async job => {
  //   console.log('JOB', job);
  // });
  //
  // myQueue.add('paint', { gna: 'gnagna' });

  return {
    ...bullmq,
    Queue,
    Worker,
    QueueEvents,
    FlowProducer,
  };
};
