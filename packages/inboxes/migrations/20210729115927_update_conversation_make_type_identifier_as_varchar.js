export async function up(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.conversation, (t) => {
    t.string('type_identifier', 100).alter();
  });
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.conversation, (t) => {
    t.bigInteger('type_identifier').alter();
  });
}
