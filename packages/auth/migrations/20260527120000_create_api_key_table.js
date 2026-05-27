// API-key store for the better-auth `@better-auth/api-key` plugin.
//
// No FK to user — ownership is the plugin's generic `reference_id` (a user uid
// or `agenda:<uid>`), kept decoupled like the other better-auth tables. Column
// names mirror the plugin's camelCase schema remapped to snake_case (see the
// `apiKeyPlugin` schema mapping in packages/auth/src/index.js). Free-form JSON
// (permissions, metadata) is TEXT; indexed columns stay VARCHAR(255) because
// MySQL can't index TEXT without a prefix length. DATETIME(3) matches the
// plugin's ms-precision timestamps; durations (ms) are BIGINT to be safe.

export async function up(knex) {
  const { schemas } = knex.client.config;
  const { apiKey } = schemas;

  if (!await knex.schema.hasTable(apiKey)) {
    await knex.schema.createTable(apiKey, (t) => {
      t.bigIncrements('id').primary();
      t.string('config_id', 255).notNullable().defaultTo('default');
      t.string('name', 255).nullable();
      t.string('start', 255).nullable();
      t.string('reference_id', 255).notNullable();
      t.string('prefix', 255).nullable();
      t.string('key', 255).notNullable();
      t.bigint('refill_interval').nullable();
      t.integer('refill_amount').nullable();
      t.dateTime('last_refill_at', { precision: 3 }).nullable();
      t.boolean('enabled').notNullable().defaultTo(true);
      t.boolean('rate_limit_enabled').notNullable().defaultTo(true);
      t.bigint('rate_limit_time_window').nullable();
      t.integer('rate_limit_max').nullable();
      t.integer('request_count').notNullable().defaultTo(0);
      t.integer('remaining').nullable();
      t.dateTime('last_request', { precision: 3 }).nullable();
      t.dateTime('expires_at', { precision: 3 }).nullable();
      t.dateTime('created_at', { precision: 3 }).notNullable();
      t.dateTime('updated_at', { precision: 3 }).notNullable();
      t.text('permissions').nullable();
      t.text('metadata').nullable();
      t.index('reference_id', 'idx_api_key_reference_id');
      t.index('key', 'idx_api_key_key');
      t.index('config_id', 'idx_api_key_config_id');
    });
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists(knex.client.config.schemas.apiKey);
}
