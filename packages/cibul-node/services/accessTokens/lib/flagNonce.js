'use strict';

const log = require('@openagenda/logs')('services/accessTokens/flagNonce');

module.exports = async (knex, token = {}, nonce = null) => {
  const record = await knex('access_token_nonce')
    .first('id')
    .where({
      access_token_id: token.id,
      nonce,
    });

  if (record) {
    log('info', 'nonce has already been used', { token: token.token, nonce });

    throw new Error('nonce has already been used');
  }

  await knex('access_token_nonce').insert({
    access_token_id: token.id,
    nonce,
  });

  log('info', 'nonce was unique', {
    token: token.token,
    nonce,
  });
};
