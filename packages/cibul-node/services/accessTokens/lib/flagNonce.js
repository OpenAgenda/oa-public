'use strict';

const log = require('@openagenda/logs')('services/accessTokens/flagNonce');

const validateInteger = require('@openagenda/validators/integer');
const { BadRequest } = require('@openagenda/verror');

const validateNonce = validateInteger({
  min: 0,
  max: 10 ** 15 - 1,
});

module.exports = async (knex, token = {}, nonce = null) => {
  try {
    validateNonce(nonce);
  } catch (errors) {
    throw new BadRequest({ info: { errors } }, 'nonce is not valid');
  }

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
