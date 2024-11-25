export function up(knex) {
  const { schemas } = knex.client.config;

  return knex.schema.alterTable(schemas.inbox, (t) => {
    t.index(['type', 'identifier']);
  });
}

export function down(knex) {
  const { schemas } = knex.client.config;

  return knex.schema.alterTable(schemas.inbox, (t) => {
    t.dropIndex(['type', 'identifier']);
  });
}
