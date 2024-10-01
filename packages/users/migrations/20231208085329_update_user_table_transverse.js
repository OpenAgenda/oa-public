'use strict';

const columnName = 'transverse_api_access';

exports.up = async (knex) => {
  const { schemas } = knex.client.config;

  const haveColumn = await knex.schema.hasColumn(schemas.user, columnName);

  if (haveColumn) {
    return;
  }

  return knex.schema.table(schemas.user, (t) => {
    t.boolean(columnName).defaultTo(0);
  });
};

exports.down = async (knex) => {
  const { schemas } = knex.client.config;

  const haveColumn = await knex.schema.hasColumn(schemas.user, columnName);

  if (!haveColumn) {
    return;
  }

  return knex.schema.table(schemas.user, (t) => {
    t.dropColumn(columnName);
  });
};
