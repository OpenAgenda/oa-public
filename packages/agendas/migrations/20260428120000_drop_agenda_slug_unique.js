export async function up(knex) {
  const { schemas } = knex.client.config;

  // Slug uniqueness is enforced at the application layer (Unicity service)
  // with a `whereNull('deleted_at')` filter, so soft-deleted rows can keep
  // their slug. The DB-level UNIQUE constraint conflicts with that policy
  // by also forbidding deleted-row collisions.
  await knex.schema.alterTable(schemas.agenda, (table) => {
    table.dropUnique('slug', 'slug');
    table.index('slug', 'slug_idx');
  });
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.agenda, (table) => {
    table.dropIndex('slug', 'slug_idx');
    table.unique('slug', { indexName: 'slug' });
  });
}
