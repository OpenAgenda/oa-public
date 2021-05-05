'use strict';

const MAX_ATTEMPTS = 1000;

module.exports = async (knex, table, field, valueGenerator) => {
  let attempts = 0;
  let previous;

  do {
    const value = valueGenerator(previous);

    if (!await knex(table).first('id').where(field, value)) {
      return value;
    }

    previous = value;
    attempts += 1;
  } while (attempts <= MAX_ATTEMPTS);

  throw new Error(`Failed to define unique value for ${table}.${field}`);
};
