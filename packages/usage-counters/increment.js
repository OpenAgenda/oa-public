import logs from '@openagenda/logs';
import createRedisKey from './utils/createRedisKey.js';
import lifespanToBeginAndEnd from './utils/lifespanToBeginAndEnd.js';

const log = logs('usageCounters/increment');

const initValue = (lifespan) => ({
  ...lifespanToBeginAndEnd(lifespan),
  store: {
    volume: 0,
    items: 0,
    calls: 0,
  },
});

export default async function increment(
  internals,
  actorNamespace,
  actorIdentifier,
  targetNamespace,
  { volume, items },
) {
  const { redisClient, lifespan, clearAndDumpBucket, redisPrefix, setKey } = internals;
  const now = new Date();
  const key = createRedisKey(
    redisPrefix,
    actorNamespace,
    actorIdentifier,
    targetNamespace,
  );
  log('called', { key, volume, items });
  // sadd to redis set
  await redisClient.sadd(setKey, key);

  // get redis key
  const value = JSON.parse(await redisClient.get(key)) || initValue(lifespan);
  log('value', value);
  const endDate = new Date(value.end);
  // check lifespan and dump if needed
  if (endDate.getTime() < now.getTime()) {
    // dump
    await clearAndDumpBucket(key, value);
    Object.assign(value, initValue(lifespan));
  }
  // add data to existingdata
  const updatedKeyValue = {
    ...value,
    store: {
      volume: value.store.volume + volume,
      items: value.store.items + items,
      calls: value.store.calls + 1,
    },
  };
  // setredisString
  await redisClient.set(key, JSON.stringify(updatedKeyValue));
  log('updated successfully');
}
