import crypto from 'node:crypto';
import logs from '@openagenda/logs';
import getTokenDeath from './getTokenDeath.js';

const TOKEN_LIFESPAN = 60 * 60 * 1000;
const log = logs('services/accessTokens/generateTokenFromSecretKey');

// D5b P4a — the v2 `tk-` mint is now pure apikey-store:
//   1. auth.verifyKey() validates the secret against the apikey store
//      (owner.kind=user, oaKind=sk are the only ones that can mint a tk-).
//   2. The owner's user.id is resolved by uid and stored on access_token.user_id
//      — getUser/loadToken read it back directly post-P3, no api_key_set hop.
//   3. The existing-token lookup is keyed on user_id (not on the legacy
//      api_key_set_id): each user owns a single live tk-, refreshed on every
//      /requestAccessToken hit. A user with multiple sk's still gets one tk-.
export default async function generateTokenFromSecretKey(
  services,
  { secretKey },
  options = {},
) {
  log('generating from secret key %s', secretKey);

  const { loadUser = false } = options;
  const { knex, auth, users } = services;

  const verified = await auth.verifyKey(secretKey);

  if (
    !verified
    || verified.owner?.kind !== 'user'
    || verified.oaKind !== 'sk'
  ) {
    throw new Error('Invalid key');
  }

  const user = await users.findOne({
    query: { uid: verified.owner.userUid },
    detailed: loadUser,
  });

  if (!user) {
    throw new Error('Invalid key');
  }

  const userId = user.id;

  const token = await knex('access_token')
    .first(['id', 'token', 'created_at', 'lifespan'])
    .where('user_id', userId)
    .orderBy('id', 'desc');

  const tokenDeath = token && getTokenDeath(token);
  const tokenIsDead = token && tokenDeath < new Date();

  if (token && !tokenIsDead) {
    const newLifespan = Math.ceil(
      new Date().getTime() + TOKEN_LIFESPAN - token.created_at.getTime(),
    );

    const update = {
      lifespan: Math.floor(newLifespan / 1000),
      updated_at: new Date(),
    };

    await knex('access_token').update(update).where('id', token.id);

    const updatedToken = {
      ...token,
      ...update,
    };

    return loadUser ? { token: updatedToken, user } : updatedToken;
  }

  const newToken = {
    user_id: userId,
    created_at: new Date(),
    updated_at: new Date(),
    token: `tk-${crypto
      .createHmac('sha256', 'okilydokily')
      .update(secretKey + new Date().getTime() + userId)
      .digest('hex')
      .substr(0, 29)}`,
    lifespan: TOKEN_LIFESPAN / 1000,
  };

  const newTokenId = (await knex('access_token').insert(newToken))[0];

  newToken.id = newTokenId;

  log('generated new token %j', newToken);

  return loadUser ? { token: newToken, user } : newToken;
}
