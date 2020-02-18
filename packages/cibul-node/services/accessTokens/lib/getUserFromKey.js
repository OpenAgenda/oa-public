'use strict';

const getApiKeySetFromKey = require('./getApiKeySetFromKey');

async function getUserFromKey(knex, users, keyField, keyString = null) {
  const apiKeySet = await getApiKeySetFromKey(knex, keyField, keyString);

  if (!apiKeySet) {
    throw new Error('invalid key');
  }

  return users.findOne({
    query: {
      id: apiKeySet.user_id
    }
  });
}

module.exports = (knex, users, keyString = null) => getUserFromKey(knex, users, 'api_key', keyString);

module.exports.secret = (knex, users, keyString = null) => getUserFromKey(knex, users, 'api_secret', keyString);
