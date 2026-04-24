import logs from '@openagenda/logs';
import sendMessageChain from './sendMessageChain.js';

const log = logs('services/members/sendGroupMail/task');

export default function task({ config, queue, services }) {
  log('task');
  const { bull } = services;

  const worker = new bull.Worker(
    queue.name,
    async (job) => {
      switch (job.name) {
        case 'sendMessageChain':
          await sendMessageChain(config, { queue, services }, job.data);
          break;
        default:
          log.warn(`Unknown job ${job.name}`);
      }
    },
    {
      prefix: queue.opts.prefix,
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

  worker.on('error', (failedReason) => log.error('error', failedReason));
  worker.on('failed', (job, error) =>
    log.error(job.name, 'failed', job.data, error));
  // worker.on('active', job => {});
  worker.on('completed', (job, result, prev) =>
    log.debug(job.name, 'completed', prev));

  return {
    shutdown: async () => worker.close(),
  };
}
