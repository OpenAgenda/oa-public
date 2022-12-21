'use strict';

const getApiKeySetFromKey = require('./getApiKeySetFromKey');

async function getUserFromKey(services, keyField, keyString = null) {
  const {
    users,
    knex,
    simpleCache,
  } = services;

  const cached = await simpleCache('users', `${keyField}:${keyString}`).get();

  if (cached) {
    return JSON.parse(cached);
  }

  const apiKeySet = await getApiKeySetFromKey(knex, keyField, keyString);

  if (!apiKeySet) {
    throw new Error('invalid key');
  }

  const user = await users.findOne({
    query: {
      id: apiKeySet.user_id,
    },
  });

  simpleCache('users', `${keyField}:${keyString}`).set(JSON.stringify(user), 60 * 60);

  return user;
}

module.exports = (services, keyString = null) => getUserFromKey(services, 'api_key', keyString);

module.exports.secret = (services, keyString = null) => getUserFromKey(services, 'api_secret', keyString);
