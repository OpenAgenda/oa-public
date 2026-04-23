export async function up(knex) {
  const { schemas } = knex.client.config;
  const columnName = 'reply_token';

  const haveColumn = await knex.schema.hasColumn(schemas.user, columnName);

  if (haveColumn) {
    return;
  }

  return knex.schema.table(schemas.user, (t) => {
    t.string(columnName).nullable().after('api_key').unique();
  });
}

export async function down(knex) {
  const { schemas } = knex.client.config;
  const columnName = 'reply_token';

  const haveColumn = await knex.schema.hasColumn(schemas.user, columnName);

  if (!haveColumn) {
    return;
  }

  return knex.schema.table(schemas.user, (t) => {
    t.dropColumn(columnName);
  });
}
