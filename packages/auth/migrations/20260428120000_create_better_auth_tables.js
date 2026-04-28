// No FK to user — keeps services decoupled and tests independent.
// Sessions live in Redis (better-auth secondaryStorage), not in the DB.
// All ids are BIGINT AUTO_INCREMENT (better-auth `generateId: 'serial'`).
//
// Column types follow better-auth's reference schema (TEXT for free-form
// fields, DATETIME(3) for ms precision matching `timestamp(3)`). Indexed
// columns (account_id, provider_id, identifier) stay VARCHAR(255) because
// MySQL can't index TEXT without an explicit prefix length.

export async function up(knex) {
  const { schemas } = knex.client.config;
  const { account, verification } = schemas;

  if (!await knex.schema.hasTable(account)) {
    await knex.schema.createTable(account, (t) => {
      t.bigIncrements('id').primary();
      t.bigint('user_id').notNullable();
      t.string('account_id', 255).notNullable();
      t.string('provider_id', 255).notNullable();
      t.text('password').nullable();
      t.text('access_token').nullable();
      t.text('refresh_token').nullable();
      t.dateTime('access_token_expires_at', { precision: 3 }).nullable();
      t.dateTime('refresh_token_expires_at', { precision: 3 }).nullable();
      t.text('scope').nullable();
      t.text('id_token').nullable();
      t.dateTime('created_at', { precision: 3 }).notNullable();
      t.dateTime('updated_at', { precision: 3 }).notNullable();
      t.index('user_id', 'idx_account_user_id');
      t.unique(['provider_id', 'account_id'], {
        indexName: 'idx_account_provider_account',
      });
    });
  }

  if (!await knex.schema.hasTable(verification)) {
    await knex.schema.createTable(verification, (t) => {
      t.bigIncrements('id').primary();
      t.string('identifier', 255).notNullable();
      t.text('value').notNullable();
      t.dateTime('expires_at', { precision: 3 }).notNullable();
      t.dateTime('created_at', { precision: 3 }).notNullable();
      t.dateTime('updated_at', { precision: 3 }).notNullable();
      t.index('identifier', 'idx_verification_identifier');
      t.index('expires_at', 'idx_verification_expires_at');
    });
  }
}

export async function down(knex) {
  const { schemas } = knex.client.config;
  await knex.schema.dropTableIfExists(schemas.verification);
  await knex.schema.dropTableIfExists(schemas.account);
}
