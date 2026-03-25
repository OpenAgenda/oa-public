import logs from '@openagenda/logs';

const log = logs('usageCounters/clearRedisKeys');

export default async function clearRedisKeys({ redisClient, setKey }) {
  const allKeys = await redisClient.smembers(setKey);
  log('allkeys in set', allKeys);
  for (const key of allKeys) {
    redisClient.del(key);
    redisClient.srem(setKey, key);
  }
  log(
    'all redis keys in set were remove from set and deleted',
    await redisClient.smembers(setKey),
  );
}
