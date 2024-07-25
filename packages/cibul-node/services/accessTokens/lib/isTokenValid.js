import logs from '@openagenda/logs';
import getTokenDeath from './getTokenDeath.js';

const log = logs('services/accessTokens/isTokenValid');

export default async (knex, token) => {
  log('info', 'verifying token', { token: token.token });

  const tokenDeath = getTokenDeath(token);

  if (tokenDeath < new Date()) {
    log('info', 'token is expired', {
      token: token.token,
      tokenDeath: JSON.stringify(tokenDeath),
    });

    throw new Error('access token is expired');
  }
};
