import logs from '@openagenda/logs';

const log = logs('usageCounters/task');

export default async function task(internals) {
  log('running');
  const { redisClient, setKey, clearAndDumpBucket } = internals;

  const now = new Date();
  const allKeys = await redisClient.smembers(setKey);
  log('allKeys length ', allKeys.length);
  for (const key of allKeys) {
    const rawValue = await redisClient.get(key);
    if (!rawValue) continue;
    const value = JSON.parse(rawValue);
    const endDate = new Date(value.end);
    if (endDate.getTime() < now.getTime()) {
      // dump
      clearAndDumpBucket(key, value);
    }
  }
}
