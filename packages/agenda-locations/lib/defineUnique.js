'use strict';

const MAX_ATTEMPTS = 1000;

module.exports = async (service, field, valueGenerator) => {
  const { knex } = service.clients;
  const { schema } = service.config;

  let attempts = 0;

  do {
    const value = valueGenerator();

    if (!(await knex(schema).first('id').where(field, value))) {
      return value;
    }

    attempts += 1;
  } while (attempts <= MAX_ATTEMPTS);

  throw new Error(`Failed to defined new ${field}`);
};
