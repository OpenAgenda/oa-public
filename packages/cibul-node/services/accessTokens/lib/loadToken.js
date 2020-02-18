'use strict';

const log = require('@openagenda/logs')('services/accessTokens/loadToken');

module.exports = (knex, tokenString) => knex('access_token')
  .first(['id', 'created_at', 'lifespan', 'token', 'api_key_set_id'])
  .where('token', tokenString)
  .then(token => {
    if (!token) {
      log('info', 'token not found', { token: tokenString });
      throw new Error('access token is invalid');
    }

    return token;
  });
