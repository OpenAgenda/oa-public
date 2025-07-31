/* eslint-disable max-classes-per-file */

import bullmq from 'bullmq';
import logs from '@openagenda/logs';

const log = logs('services/bull');

function normalizeOpts(opts, { connection, queuesPrefix }) {
  const prefix = (queuesPrefix ?? '') + (opts.prefix ?? '');
  if (!prefix?.match(/\{.+\}/)) {
    console.warn(
      [
        'BullMQ: WARNING! Your option prefix must be defined with a redis cluster hash tag.',
        'See more at https://docs.bullmq.io/bull/patterns/redis-cluster',
      ].join(' '),
    );
  }
  return {
    prefix,
    connection,
    ...opts,
  };
}

export function init(config, services) {
  log('init');

  const connection = services.redis.ioRedis;
  const { queuesPrefix } = config;

  class Queue extends bullmq.Queue {
    constructor(name, opts, con) {
      const options = normalizeOpts(opts, { connection, queuesPrefix });
      super(name, options, con);
    }
  }

  class Worker extends bullmq.Worker {
    constructor(name, processor, opts, con) {
      const options = normalizeOpts(opts, { connection, queuesPrefix });
      super(name, processor, options, con);
    }
  }

  class QueueEvents extends bullmq.QueueEvents {
    constructor(name, opts, con) {
      const options = normalizeOpts(opts, { connection, queuesPrefix });
      super(name, options, con);
    }
  }

  class FlowProducer extends bullmq.FlowProducer {
    constructor(opts, con) {
      const options = normalizeOpts(opts, { connection, queuesPrefix });
      super(options, con);
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
}
