import logs from '@openagenda/logs';
import checkIsInactiveUser from './lib/checkIsInactiveUser.js';
import checkIsInactiveContributor from './lib/checkIsInactiveContributor.js';

const log = logs('services/behavioralEmails');

export async function init(config, services) {
  const { bull, users, mails } = services;

  const queue = new bull.Queue('behavioralEmails', {
    prefix: '{behavioralEmails}',
  });

  const worker = new bull.Worker(
    queue.name,
    async (job) => {
      switch (job.name) {
        case 'inactiveUser': {
          try {
            const { userUid } = job.data;
            const user = await users.findOne({
              query: {
                uid: userUid,
                isActivated: true,
                isBlacklisted: {
                  $or: [null, false], // isBlacklisted is not always defined
                },
              },
            });

            if (!user) {
              log.info('User not found', { userUid });
              return;
            }

            if (await checkIsInactiveUser(services, userUid)) {
              log.info('Send email to inactive user +7d', { userUid });

              const lang = user.culture || 'fr';

              await mails.send({
                template: 'inactiveNewUser',
                to: {
                  address: user.email,
                  unsubscriptions: [
                    {
                      rule: ['receive', 'behavioralEmails'],
                      dataPath: 'unsubscribeLink',
                    },
                  ],
                },
                lang,
              });

              return;
            }

            const { result: isInactiveContributor, lastAgenda } = await checkIsInactiveContributor(services, userUid);
            if (isInactiveContributor) {
              log.info('Send email to inactive contributor +7d', { userUid });

              const lang = user.culture || 'fr';

              await mails.send({
                template: 'inactiveNewContributor',
                to: {
                  address: user.email,
                  unsubscriptions: [
                    {
                      rule: ['receive', 'behavioralEmails'],
                      dataPath: 'unsubscribeLink',
                    },
                  ],
                },
                data: {
                  agenda: lastAgenda,
                },
                lang,
              });

              return;
            }

            log.info('User is active in the last 7d', { userUid });
          } catch (e) {
            log.error('Error on sending inactiveNewUser', e);
          }

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
