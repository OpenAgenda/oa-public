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

// Teardown d'un service portant une ou plusieurs queues : ferme le(s) worker(s)
// PUIS, en test (`clear`/`reset`), obliterate la (les) queue(s). On obliterate
// plutôt que `drain()` car `drain()` ne retire que les jobs en attente à
// l'instant T, laissant fuiter dans la suite suivante un job enqueué pendant la
// fermeture. La fermeture des workers est ici redondante avec `closeWorkers()`
// (cf. init) mais on la garde pour que le helper reste correct appelé isolément ;
// `worker.close()` est idempotent.
export async function teardownQueues(workers, queues, { clear, reset } = {}) {
  for (const worker of [].concat(workers)) {
    await worker.close();
  }

  if (clear || reset) {
    for (const queue of [].concat(queues)) {
      await queue.obliterate({ force: true });
    }
  }
}

export function init(config, services) {
  log('init');

  const connection = services.redis;
  const { queuesPrefix } = config;

  // Tous les workers créés via ce wrapper, pour les fermer globalement au
  // shutdown AVANT toute purge de queue (cf. closeWorkers).
  const workers = [];

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
      workers.push(this);
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

  // Ferme TOUS les workers (tous services confondus) avant que `services.shutdown`
  // ne purge les queues. Garantit qu'aucun worker ne tourne pendant un
  // `obliterate()`, donc qu'aucun job en vol ne peut ré-enqueuer dans une queue
  // déjà purgée — y compris à travers les frontières de services
  // (producteur → queue d'un consommateur). Résilient : une fermeture qui échoue
  // n'empêche pas les autres.
  async function closeWorkers() {
    await Promise.all(
      workers.map((worker) =>
        worker
          .close()
          .catch((err) => log('warn', 'worker close failed: %s', err.message))),
    );
  }

  return {
    ...bullmq,
    Queue,
    Worker,
    QueueEvents,
    FlowProducer,
    teardownQueues,
    closeWorkers,
  };
}
