export async function up(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.conversation, (t) => {
    t.timestamp('closed_at').nullable().defaultTo(null);
  });
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.conversation, (t) => {
    t.dropColumn('closed_at');
  });
}
