import logs from '@openagenda/logs';

const log = logs('invalidateListCache');

export default async function invalidateListCache(
  { redis, cachePrefix },
  agendaUid,
) {
  if (!redis) return;

  try {
    const pattern = `${cachePrefix}:{${agendaUid}}:*`;
    const keys = [];

    for await (const key of redis.scanIterator({
      MATCH: pattern,
      COUNT: 200,
    })) {
      keys.push(key);
    }

    if (keys.length) {
      await Promise.all(keys.map((key) => redis.del(key)));
      log('invalidated %d cache entries for agenda %s', keys.length, agendaUid);
    }
  } catch (e) {
    log('error', 'failed to invalidate list cache', {
      agendaUid,
      exception: e,
    });
  }
}
