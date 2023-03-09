'use strict';

const isTokenValid = require('./isTokenValid');
const loadToken = require('./loadToken');
const flagNonce = require('./flagNonce');

module.exports = async (knex, tokenString, nonce) => {
  const token = await loadToken(knex, tokenString);

  await isTokenValid(knex, token);
  await flagNonce(knex, token, nonce);
};
