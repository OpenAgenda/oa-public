import isTokenValid from './isTokenValid.js';
import loadToken from './loadToken.js';
import flagNonce from './flagNonce.js';

export default async (knex, tokenString, nonce) => {
  const token = await loadToken(knex, tokenString);

  await isTokenValid(knex, token);
  await flagNonce(knex, token, nonce);
};
