import logs from '@openagenda/logs';
import isInactiveUser from './lib/isInactiveUser.js';

const log = logs('services/behavioralEmails');

export async function init(config, services) {
  const { bull /* , users, mails */ } = services;

  const queue = new bull.Queue('behavioralEmails', {
    prefix: '{behavioralEmails}',
  });

  const worker = new bull.Worker(
    queue.name,
    async (job) => {
      switch (job.name) {
        case 'inactiveUser': {
          const { userUid } = job.data;
          if (!await isInactiveUser(services, userUid)) {
            return;
          }

          log.info('Send email to inactive user +7j', { userUid });

          // const user = await users.get(userUid);
          // const lang = user.culture || 'fr';
          //
          // await mails.send({
          //   template: 'inactiveNewUser',
          //   to: {
          //     address: user.email,
          //     unsubscriptions: [
          //       {
          //         rule: ['receive', 'behavioralEmails'],
          //         dataPath: 'unsubscribeLink',
          //       },
          //     ],
          //   },
          //   lang,
          // });

          break;
        }
        default:
          log.warn(`Unknown job ${job.name}`);
      }
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

  worker.on('error', (failedReason) => log.error('error', failedReason));
  worker.on('failed', (job, error) =>
    log.error(job.name, 'failed', job.data, error));
  // worker.on('active', job => {});
  worker.on('completed', (job, result, prev) =>
    log.debug(job.name, 'completed', prev));

  return {
    addJob(name, data, opts) {
      return queue.add(name, data, opts);
    },
    task() {
      worker.run();
    },
  };
}
