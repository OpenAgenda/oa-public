'use strict';

exports.up = async knex => {
  const { schemas } = knex.client.config;
  const columnName = 'reply_token';

  const haveColumn = await knex.schema.hasColumn(schemas.user, columnName);

  if (haveColumn) {
    return;
  }

  return knex.schema.table(schemas.user, t => {
    t.string(columnName)
      .nullable()
      .unique();
  });
};

exports.down = async knex => {
  const { schemas } = knex.client.config;
  const columnName = 'reply_token';

  const haveColumn = await knex.schema.hasColumn(schemas.user, columnName);

  if (!haveColumn) {
    return;
  }

  return knex.schema.table(schemas.user, t => {
    t.dropColumn(columnName);
  });
};
