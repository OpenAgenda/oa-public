'use strict';

const MAX_ATTEMPTS = 1000;

module.exports = async (service, field, valueGenerator) => {
  const knex = service.clients.knex;
  const schema = service.config.schema;
  let attempts = 0;
  let previous;

  do {
    const value = valueGenerator(previous);

    if (!await knex(schema).first('id').where(field, value)) {
      return value;
    }

    previous = value;
    attempts++;
  } while (attempts <= MAX_ATTEMPTS);

  throw new Error('Failed to defined new ' + field);
}
