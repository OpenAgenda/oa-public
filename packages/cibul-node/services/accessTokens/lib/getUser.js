import VError from '@openagenda/verror';
import loadToken from './loadToken.js';
import isTokenValid from './isTokenValid.js';

// D5b P3 — read cutover: resolve the user from `access_token.user_id` only.
// The P2 fallback on the `api_key_set` join is gone; every live row has been
// backfilled at P1 and dual-written since the P2 deploy, so a null here is
// either corruption or an unexpected race and must throw.
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
