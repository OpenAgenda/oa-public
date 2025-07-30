import logs from '@openagenda/logs';

const log = logs('core/tasks');

export default function tasks(services) {
  const { queues, bull } = services;

  const oldQueue = queues('core');

  const jobProcessors = {};

  const queue = new bull.Queue('core', { prefix: '{core}' });
  const worker = new bull.Worker(
    queue.name,
    (job) => {
      const processor = jobProcessors[job.name];
      if (processor) {
        return processor(job.data);
      }
      log.warn(`Unknown job ${job.name}`);
    },
    {
      prefix: queue.opts.prefix,
      autorun: false,
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
        count: 1000, // keep up to 1000 jobs
      },
    },
  );

  oldQueue.register({
    agendaBatchList: (agendaUid, operation, query, ...args) =>
      queue.add('agendaBatchList', { agendaUid, operation, query, args }),
    agendaBatchSearch: (agendaUid, operation, query, ...args) =>
      queue.add('agendaBatchSearch', { agendaUid, operation, query, args }),
    batchedPatch: (agendaUid, eventUid, data, options) =>
      queue.add('batchedPatch', [agendaUid, eventUid, data, options]),
    batchedUpdate: (agendaUid, eventUid, data, options) =>
      queue.add('batchedUpdate', [agendaUid, eventUid, data, options]),
    batchedRemove: (agendaUid, eventUid, options) =>
      queue.add('batchedRemove', [agendaUid, eventUid, options]),
    batchResyncEvents: (agendaUid, query, options) =>
      queue.add('batchResyncEvents', { agendaUid, query, options }),
    rebuildSearch: (agendaUid) => queue.add('rebuildSearch', agendaUid),
    resyncInbox: (agendaUid) => queue.add('resyncInbox', agendaUid),
    rebuildActivities: (agendaUid) => queue.add('rebuildActivities', agendaUid),
    agendaRebuild: (agendaUid) => queue.add('agendaRebuild', agendaUid),
  });

  return Object.assign(
    (ons = {}) => {
      oldQueue.run();

      worker.on(
        'error',
        ons.error || ((failedReason) => log.error('error', failedReason)),
      );
      worker.on(
        'failed',
        ons.failed
          || ((job, error) => log.error(job.name, 'failed', job.data, error)),
      );
      worker.on(
        'active',
        ons.active || ((job) => log.info(job.name, 'active', job.data)),
      );
      worker.on(
        'completed',
        ons.completed
          || ((job, result, prev) => log.debug(job.name, 'completed', prev)),
      );

      if (!worker.isRunning()) {
        worker.run();
      }
    },
    {
      register: (fns) => Object.assign(jobProcessors, fns),
      enqueue: (...args) => queue.add(...args),
      clear: async () => {
        await oldQueue.clear();
        await queue.drain();
      },
      stop: async (options = {}) => {
        if (options.reset) {
          await oldQueue.clear();
          await queue.drain();
        }
        await oldQueue.stop();
        await worker.close();
      },
    },
  );
}
