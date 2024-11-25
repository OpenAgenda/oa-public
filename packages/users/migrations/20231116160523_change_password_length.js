const columnName = 'password';

export async function up(knex) {
  const { schemas } = knex.client.config;

  return knex.schema.table(schemas.user, (t) => {
    t.string(columnName, 64).alter();
  });
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  return knex.schema.table(schemas.user, (t) => {
    t.string(columnName, 40).alter();
  });
}
