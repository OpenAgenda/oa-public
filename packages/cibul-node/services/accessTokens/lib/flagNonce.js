import logs from '@openagenda/logs';
import validateInteger from '@openagenda/validators/integer.js';
import { BadRequest } from '@openagenda/verror';

const log = logs('services/accessTokens/flagNonce');

const validateNonce = validateInteger({
  min: 0,
  max: 10 ** 15 - 1,
});

export default async (knex, token = {}, nonce = null) => {
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
