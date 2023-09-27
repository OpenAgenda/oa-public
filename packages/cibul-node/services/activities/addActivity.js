'use strict';

const log = require('@openagenda/logs')('services/activities/addActivity');

module.exports = ({ bull, activities }) => {
  const queue = new bull.Queue('addActivity', { prefix: '{addActivity}' });

  return Object.assign(function addActivity(feedIdentifiers, activity) {
    return queue.add('addActivity', { feedIdentifiers, activity });
  }, {
    task() {
      const worker = new bull.Worker(queue.name, async job => {
        switch (job.name) {
          case 'addActivity': {
            const { feedIdentifiers, activity } = job.data;
            await activities.feed(feedIdentifiers).activities.add(activity);
            break;
          }
          default:
            log.warn(`Unkown job ${job.name}`);
        }
      }, {
        prefix: queue.opts.prefix,
        removeOnComplete: {
          age: 3600, // keep up to 1 hour
          count: 1000, // keep up to 1000 jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // keep up to 7 days
          count: 1000, // keep up to 1000 jobs
        },
      });

      worker.on('error', failedReason => log.error('error', failedReason));
      worker.on('failed', (job, error) => log.error(job.name, 'failed', job.data, error));
      // worker.on('active', job => {});
      worker.on('completed', (job, result, prev) => log.debug(job.name, 'completed', prev));
    },
  });
};
