'use strict';

const MAX_ATTEMPTS = 1000;

module.exports = async service => {
  const knex = service.clients.knex;
  const schema = service.config.schema;
  let attempts = 0;

  do {
    const uid = Math.ceil(Math.random() * 99999999);

    if (!await knex(schema).first('id').where('uid', uid)) {
      return uid;
    }

    attempts++;
  } while (attempts <= MAX_ATTEMPTS);

  throw new Error('Failed to defined new UID');
}
