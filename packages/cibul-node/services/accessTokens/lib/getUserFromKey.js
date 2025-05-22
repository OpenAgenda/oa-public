import { NotFound, Forbidden } from '@openagenda/verror';
import getApiKeySetFromKey from './getApiKeySetFromKey.js';

async function getUserFromKey(services, keyField, keyString = null) {
  const { users, knex, simpleCache } = services;

  const cached = await simpleCache('users', `${keyField}:${keyString}`).get();

  if (cached) {
    return JSON.parse(cached);
  }

  const apiKeySet = await getApiKeySetFromKey(knex, keyField, keyString);

  if (!apiKeySet) {
    throw new NotFound('invalid key');
  }

  const user = await users.findOne({
    query: {
      id: apiKeySet.user_id,
    },
    detailed: true,
  });

  if (!user) {
    throw new NotFound('user not found');
  }

  if (user.isBlacklisted) {
    throw new Forbidden('user is blacklisted');
  }

  simpleCache('users', `${keyField}:${keyString}`).set(
    JSON.stringify(user),
    60 * 60,
  );

  return user;
}

export default (services, keyString = null) =>
  getUserFromKey(services, 'api_key', keyString);

export function secret(services, keyString = null) {
  return getUserFromKey(services, 'api_secret', keyString);
}
