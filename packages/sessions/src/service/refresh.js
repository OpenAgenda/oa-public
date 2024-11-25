import logger from '@openagenda/logs';
import { getUser, generateSessionUser } from './helpers/index.js';

const log = logger('refresh');

export default async (config, identifier) => {
  const { redisClient, interfaces, redis } = config;

  const sessionKey = [redis.prefix, identifier].join(':');

  log('refreshing session for key %s', sessionKey);

  if (!await redisClient.get(sessionKey)) {
    return null;
  }

  const user = await getUser(interfaces, { uid: identifier });

  log('fetched user %j', user);

  const { sessionUser } = generateSessionUser(config, user);

  log('generated %j', sessionUser);

  await redisClient.set(sessionKey, JSON.stringify(sessionUser));
};
