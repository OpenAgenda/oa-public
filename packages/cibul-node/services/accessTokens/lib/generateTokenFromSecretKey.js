'use strict';

const TOKEN_LIFESPAN = 60 * 60 * 1000;
const crypto = require('crypto');
const log = require('@openagenda/logs')('services/accessTokens/generateTokenFromSecretKey');

const getApiKeySetFromKey = require('./getApiKeySetFromKey');
const getTokenDeath = require('./getTokenDeath');

const {
  secret: getUserFromSecretKey
} = require('./getUserFromKey');

module.exports = async function generateTokenFromSecretKey(services, { secretKey }, options = {}) {
  log('generating from secret key %s', secretKey);

  const {
    loadUser = false
  } = options;

  const {
    knex
  } = services;

  const apiKeySet = await getApiKeySetFromKey(knex, 'api_secret', secretKey);

  if (!apiKeySet) {
    throw new Error('Invalid key');
  }

  const token = await knex('access_token')
    .first(['id', 'token', 'created_at', 'lifespan'])
    .where('api_key_set_id', apiKeySet.id)
    .orderBy('id', 'desc');

  const tokenDeath = token && getTokenDeath(token);
  const tokenIsDead = token && (tokenDeath < new Date());

  if (token && !tokenIsDead) {
    const newLifespan = Math.ceil((new Date()).getTime() + TOKEN_LIFESPAN - (token.created_at).getTime());

    const update = {
      lifespan: Math.floor(newLifespan / 1000),
      updated_at: new Date()
    };

    await knex('access_token')
      .update(update)
      .where('id', token.id);

    const updatedToken = {
      ...token,
      ...update
    };

    return loadUser ? {
      token: updatedToken,
      user: await getUserFromSecretKey(services, secretKey)
    } : updatedToken;
  }

  const newToken = {
    api_key_set_id: apiKeySet.id,
    created_at: new Date(),
    updated_at: new Date(),
    token: crypto.createHmac('sha256', 'okilydokily')
      .update(secretKey + (new Date()).getTime() + apiKeySet.id)
      .digest('hex')
      .substr(0, 32),
    lifespan: TOKEN_LIFESPAN / 1000
  };

  const newTokenId = (await knex('access_token').insert(newToken))[0];

  newToken.id = newTokenId;

  return loadUser ? {
    token: newToken,
    user: await getUserFromSecretKey(services, secretKey)
  } : newToken;
};
