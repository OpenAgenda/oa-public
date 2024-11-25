const columnName = 'transverse_api_access';

export async function up(knex) {
  const { schemas } = knex.client.config;

  const haveColumn = await knex.schema.hasColumn(schemas.user, columnName);

  if (haveColumn) {
    return;
  }

  return knex.schema.table(schemas.user, (t) => {
    t.boolean(columnName).defaultTo(0);
  });
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  const haveColumn = await knex.schema.hasColumn(schemas.user, columnName);

  if (!haveColumn) {
    return;
  }

  return knex.schema.table(schemas.user, (t) => {
    t.dropColumn(columnName);
  });
}
