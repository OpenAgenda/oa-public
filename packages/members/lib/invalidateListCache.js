import logs from '@openagenda/logs';

const log = logs('invalidateListCache');

export default async function invalidateListCache(
  { redis, cachePrefix },
  agendaUid,
) {
  if (!redis) return;

  try {
    const pattern = `${cachePrefix}:{${agendaUid}}:*`;
    const keys = await new Promise((resolve, reject) => {
      const found = [];
      const stream = redis.scanStream({
        match: pattern,
        count: 200,
      });
      stream.on('data', (batch) => {
        found.push(...batch);
      });
      stream.on('end', () => resolve(found));
      stream.on('error', reject);
    });

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
