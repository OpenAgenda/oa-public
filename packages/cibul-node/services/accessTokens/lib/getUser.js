'use strict';

const VError = require('@openagenda/verror');

const loadToken = require('./loadToken');
const isTokenValid = require('./isTokenValid');
const flagNonce = require('./flagNonce');

module.exports = async function getUser(knex, users, tokenString = null, nonce = null) {
  const token = await loadToken(knex, tokenString);
  if (!nonce) {
    throw new Error('nonce is required');
  }

  await isTokenValid(knex, token);
  await flagNonce(knex, token, nonce);

  const apiKeySet = await knex('api_key_set')
    .first('user_id')
    .where({
      id: token.api_key_set_id,
    });

  if (!apiKeySet) {
    throw new VError('could not find api key set matching token', { token: tokenString });
  }

  return users.findOne({
    query: {
      id: apiKeySet.user_id,
    },
  });
};
