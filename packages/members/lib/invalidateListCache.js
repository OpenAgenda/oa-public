import logs from '@openagenda/logs';

const log = logs('invalidateListCache');

export default async function invalidateListCache(
  { redis, cachePrefix },
  agendaUid,
) {
  if (!redis) return;

  try {
    const keys = await redis.keys(`${cachePrefix}:{${agendaUid}}:*`);
    if (keys.length) {
      await redis.del(...keys);
      log('invalidated %d cache entries for agenda %s', keys.length, agendaUid);
    }
  } catch (e) {
    log('error', 'failed to invalidate list cache', {
      agendaUid,
      exception: e,
    });
  }
}
