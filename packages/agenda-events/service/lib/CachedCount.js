import logs from '@openagenda/logs';

const log = logs('CachedCount');

const PREFIX = 'agenda_events:CachedCount';
const defaultLifetime = 60 * 60 * 24;

export default function CachedCount(redisClient, namespace, fn, lifetime) {
  const getKey = (args) =>
    `${PREFIX}:${namespace}:${args.filter((e) => !!e).join(':')}`;

  const getCurrentCount = async (args, forceReset = false) => {
    const key = getKey(args);
    const current = await redisClient.get(key);
    let count = current;
    log('current', count);

    if (forceReset || current === null) {
      count = await fn(...args);
      await redisClient.set(key, count);
      await redisClient.expire(key, lifetime || defaultLifetime);
    }
    return typeof count === 'string' ? parseInt(count, 10) : count;
  };

  return Object.assign((...args) => getCurrentCount(args), {
    inc: async (...args) => {
      log('inc');
      const count = args.pop();
      await getCurrentCount(args);
      return redisClient.incrby(getKey(args), count);
    },
    dec: async (...args) => {
      log('dec');
      const count = args.pop();
      await getCurrentCount(args);
      return redisClient.decrby(getKey(args), count);
    },
  });
}
