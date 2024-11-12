import isTokenValid from './isTokenValid.js';
import loadToken from './loadToken.js';

export default async (knex, tokenString) => {
  const token = await loadToken(knex, tokenString);

  await isTokenValid(knex, token);
};
