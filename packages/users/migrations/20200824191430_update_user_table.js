'use strict';

const columnName = 'is_blacklisted';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  const haveColumn = await knex.schema.hasColumn(schemas.user, columnName);

  if (haveColumn) {
    return;
  }

  return knex.schema.table(schemas.user, t => {
    t.boolean(columnName).defaultTo(0);
  });
};

exports.down = async knex => {
  const { schemas } = knex.client.config;

  const haveColumn = await knex.schema.hasColumn(schemas.user, columnName);

  if (!haveColumn) {
    return;
  }

  return knex.schema.table(schemas.user, t => {
    t.dropColumn(columnName);
  });
};
