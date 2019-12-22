'use strict';

const log = require('@openagenda/logs')('services/accessTokens/isTokenValid');
const getTokenDeath = require('./getTokenDeath');

module.exports = async (knex, token) => {
  log('info', 'verifying token', { token: token.token });

  const tokenDeath = getTokenDeath(token);

  if (tokenDeath < new Date()) {
    log('info', 'token is expired', {
      token: token.token,
      tokenDeath: JSON.stringify(tokenDeath)
    });

    throw new Error('access token is expired');
  }
}
