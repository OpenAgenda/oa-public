/* eslint-disable max-classes-per-file */

import bullmq from 'bullmq';
import logs from '@openagenda/logs';

const log = logs('services/bull');

function checkPrefixOption(opts) {
  if (!opts.prefix?.match(/\{.+\}/)) {
    console.warn(
      [
        'BullMQ: WARNING! Your option prefix must be defined with a redis cluster hash tag.',
        'See more at https://docs.bullmq.io/bull/patterns/redis-cluster',
      ].join(' '),
    );
  }
}

export function init(config, services) {
  log('init');

  const connection = services.redis.ioRedis;

  class Queue extends bullmq.Queue {
    constructor(name, opts, con) {
      checkPrefixOption(opts);
      super(name, { connection, ...opts }, con);
    }

    async add(name, data, opts = {}) {
      const newOpts = {
        ...opts,
        meta: {
          ...opts.meta || {},
          service: 'cibul-node',
        },
      };

      return super.add(name, data, newOpts);
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
}
