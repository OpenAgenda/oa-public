import VError from '@openagenda/verror';
import loadToken from './loadToken.js';
import isTokenValid from './isTokenValid.js';

// Resolve the user from `access_token.user_id` only. A null here is either
// corruption or an unexpected race and must throw.
export default async function getUser(knex, users, tokenString = null) {
  const token = await loadToken(knex, tokenString);

  await isTokenValid(knex, token);

  if (token.user_id == null) {
    throw new VError('access token has no user_id', { token: tokenString });
  }

  return users.findOne({
    query: { id: token.user_id },
    detailed: true,
  });
}
