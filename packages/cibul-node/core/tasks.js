import logs from '@openagenda/logs';

const log = logs('core/tasks');

export default function tasks(services) {
  const { bull } = services;

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

  return Object.assign(
    (ons = {}) => {
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
        await queue.drain();
      },
      stop: async (options = {}) => {
        if (options.clear) {
          await queue.drain();
        }
        await worker.close();
      },
    },
  );
}
