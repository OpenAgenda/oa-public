import logs from '@openagenda/logs';
import rebuildActivityFeeds from '@openagenda/activities/src/rebuild.js';

const log = logs('activities/rebuild');

const sinceKey = 'activities:rebuild:since';

function runRebuild({ config, since, agendaUid, activities }) {
  return rebuildActivityFeeds(
    {
      knex: config.knex,
      schemas: config.schemas,
      service: activities,
      logger: config.getLogConfig('oa', 'activities', false),
    },
    {
      since: since || 0,
      agendaUid,
    },
  );
}

async function rebuildActivities({ config, services }) {
  const { redis: redisClient, activities } = services;

  const result = await redisClient.get(sinceKey);

  const since = result ? parseInt(result, 10) : null;
  const startTime = Math.floor(Date.now() / 1000);

  try {
    await runRebuild({
      config,
      activities,
      since,
    });
  } catch (error) {
    log.error('Error on activities syncing', { error });
    return;
  }

  log.info('Synchronization end !', { since });

  await redisClient.set(sinceKey, startTime);
}

export default ({ config, services }) => ({
  rebuild: () => rebuildActivities({ services, config }),
  agendaRebuild: agendaUid =>
    runRebuild({
      activities: services.activities,
      config,
      agendaUid,
    }),
});
