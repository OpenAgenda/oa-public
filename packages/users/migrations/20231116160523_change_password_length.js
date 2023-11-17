'use strict';

const columnName = 'password';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  return knex.schema.table(schemas.user, t => {
    t.string(columnName, 64).alter();
  });
};

exports.down = async knex => {
  const { schemas } = knex.client.config;

  return knex.schema.table(schemas.user, t => {
    t.string(columnName, 40).alter();
  });
};
