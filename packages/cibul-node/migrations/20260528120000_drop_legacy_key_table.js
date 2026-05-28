// D5a — drop the legacy `key` table. Authority moved to the better-auth
// `apikey` store at D3a/D3a′, the drift fallback was removed in the same
// slice, and all legacy read/write paths (`searchByKey`, `loadBySessionOrKey`,
// `byPublicKey`, the dual-write mirror, `packages/keys`) were taken out.
//
// `api_key_set` stays alive — it's still wired into the `tk-`/`access_token`
// v2 flow (`access_token.api_key_set_id` FK), which is gelé until v2 EOL.
//
// The corresponding `create_key_table` migration is now under
// `cibul-node/migrations/legacy/` (knex tracks migrations by basename, so
// relocating without renaming is a no-op on existing DBs and recreates the
// table on fresh ones — this migration then immediately drops it; idempotent).

export async function up(knex) {
  const { schemas } = knex.client.config;
  await knex.schema.dropTableIfExists(schemas.key);
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.key);
  if (exists) return;

  await knex.schema.createTable(schemas.key, (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('type').notNullable();
    table.bigInteger('identifier').unsigned().notNullable().index();
    table.string('label');
    table.string('key').notNullable().index();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}
