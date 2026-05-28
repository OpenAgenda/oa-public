import logs from '@openagenda/logs';

const log = logs('services/accessTokens/loadToken');

export default (knex, tokenString) =>
  knex('access_token')
    .first([
      'id',
      'created_at',
      'lifespan',
      'token',
      'api_key_set_id',
      'user_id',
    ])
    .where('token', tokenString)
    .then((token) => {
      if (!token) {
        log('info', 'token not found', { token: tokenString });
        throw new Error('access token is invalid');
      }

      return token;
    });
