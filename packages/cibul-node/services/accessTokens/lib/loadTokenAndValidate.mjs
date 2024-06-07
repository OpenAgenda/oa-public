import isTokenValid from './isTokenValid.mjs';
import loadToken from './loadToken.mjs';
import flagNonce from './flagNonce.mjs';

export default async (knex, tokenString, nonce) => {
  const token = await loadToken(knex, tokenString);

  await isTokenValid(knex, token);
  await flagNonce(knex, token, nonce);
};
