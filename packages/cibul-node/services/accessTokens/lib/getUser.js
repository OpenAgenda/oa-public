import VError from '@openagenda/verror';
import loadToken from './loadToken.js';
import isTokenValid from './isTokenValid.js';

export default async function getUser(knex, users, tokenString = null) {
  const token = await loadToken(knex, tokenString);

  await isTokenValid(knex, token);

  const apiKeySet = await knex('api_key_set').first('user_id').where({
    id: token.api_key_set_id,
  });

  if (!apiKeySet) {
    throw new VError('could not find api key set matching token', {
      token: tokenString,
    });
  }

  return users.findOne({
    query: {
      id: apiKeySet.user_id,
    },
  });
}
