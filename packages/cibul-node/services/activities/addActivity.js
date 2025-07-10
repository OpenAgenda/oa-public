import logs from '@openagenda/logs';
import { BullMQOtel } from 'bullmq-otel';

const log = logs('services/activities/addActivity');

export default ({ bull, activities }) => {
  const telemetry = new BullMQOtel('oa/bull');

  const queue = new bull.Queue('addActivity', {
    prefix: '{addActivity}',
    telemetry,
  });

  return Object.assign(
    function addActivity(feedIdentifiers, activity, options = {}) {
      return queue.add('addActivity', {
        feedIdentifiers,
        activity: { ...activity, createdAt: new Date() },
        options,
      });
    },
    {
      task() {
        const worker = new bull.Worker(
          queue.name,
          async (job) => {
            switch (job.name) {
              case 'addActivity': {
                const { feedIdentifiers, activity, options } = job.data;
                await activities.feed(feedIdentifiers).activities.add(activity);

                if (options.removeFeed) {
                  await activities.feed(feedIdentifiers).remove();
                }

                break;
              }
              default:
                log.warn(`Unkown job ${job.name}`);
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
            telemetry,
          },
        );

        worker.on('error', (failedReason) => log.error('error', failedReason));
        worker.on('failed', (job, error) =>
          log.error(job.name, 'failed', job.data, error));
        // worker.on('active', job => {});
        worker.on('completed', (job, result, prev) =>
          log.debug(job.name, 'completed', prev));
      },
    },
  );
};
