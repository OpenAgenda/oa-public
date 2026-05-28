import VError from '@openagenda/verror';
import loadToken from './loadToken.js';
import isTokenValid from './isTokenValid.js';

// D5b P2 — dual-read: prefer the new `access_token.user_id` column. Fall back
// on the legacy `api_key_set` join only when the column is null, which can
// happen for rows minted before the P2 deploy (legacy code) or by N-1 if a
// rollback ever happens. The fallback goes away at P3 (read cutover).
export default async function getUser(knex, users, tokenString = null) {
  const token = await loadToken(knex, tokenString);

  await isTokenValid(knex, token);

  let userId = token.user_id;

  if (!userId) {
    const apiKeySet = await knex('api_key_set').first('user_id').where({
      id: token.api_key_set_id,
    });

    if (!apiKeySet) {
      throw new VError('could not find api key set matching token', {
        token: tokenString,
      });
    }

    userId = apiKeySet.user_id;
  }

  return users.findOne({
    query: { id: userId },
    detailed: true,
  });
}
