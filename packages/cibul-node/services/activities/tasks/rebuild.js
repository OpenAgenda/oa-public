import logs from '@openagenda/logs';

const log = logs('activities/rebuild');

const sinceKey = 'activities:rebuild:since';

function runRebuild({ since, agendaUid, services }) {
  const { activities } = services;
  return activities.rebuild({
    since: since || 0,
    agendaUid,
  });
}

async function rebuildActivities({ config, services }) {
  const { redis: redisClient } = services;
  const result = await redisClient.get(sinceKey);

  const since = result ? parseInt(result, 10) : null;
  const startTime = Math.floor(Date.now() / 1000);

  try {
    await runRebuild({
      config,
      since,
      services,
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
  agendaRebuild: (agendaUid) =>
    runRebuild({
      services,
      config,
      agendaUid,
    }),
});
