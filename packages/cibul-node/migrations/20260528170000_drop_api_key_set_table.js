// D5b P4b — terminate the legacy v2 key chain:
//   - access_token.user_id becomes NOT NULL (the new ownership column)
//   - access_token.api_key_set_id is dropped (no code touches it post-P4a)
//   - api_key_set is dropped entirely (mint pivoted to the apikey store)
//   - access_token gets a fresh FK to user, replacing the FK to api_key_set
//     that P4a tore down.
//
// Irreversible: rolling back loses the api_key_set rows. The down path
// reconstructs the schema (template-rebuild friendliness) but the user_id
// values that already moved over cannot be reconstructed without the FK
// target rows, so it is best-effort, not a data restore.

// The api_key_set table is referenced by its literal name (not via
// schemas.apiKeySet) because the same commit drops that schema entry from
// config/index.js — by the time this migration runs in prod, the indirection
// is undefined.
const API_KEY_SET = 'api_key_set';

async function fkExists(knex, table, name) {
  const [[row]] = await knex.raw(
    `SELECT 1 AS ok FROM information_schema.table_constraints
       WHERE table_schema = DATABASE()
         AND table_name = ?
         AND constraint_name = ?
         AND constraint_type = 'FOREIGN KEY'`,
    [table, name],
  );
  return !!row;
}

// Idempotent: MySQL auto-commits each DDL statement, so a mid-migration failure
// leaves the schema partially applied. Every step here checks current state to
// stay safe on re-run.
export async function up(knex) {
  const { schemas } = knex.client.config;

  const [[{ nulls }]] = await knex.raw(
    `SELECT COUNT(*) AS nulls FROM \`${schemas.accessToken}\` WHERE user_id IS NULL`,
  );
  if (Number(nulls) > 0) {
    throw new Error(
      `cannot tighten access_token.user_id: ${nulls} rows still NULL`,
    );
  }

  // user.id is BIGINT signed; the FK we add at the end of up() needs an
  // exact-type match. P1 added user_id as BIGINT UNSIGNED — flip it back to
  // signed here. Safe for our id range (well below 2^63).
  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\` MODIFY \`user_id\` BIGINT NOT NULL`,
  );

  if (await knex.schema.hasColumn(schemas.accessToken, 'api_key_set_id')) {
    await knex.schema.raw(
      `ALTER TABLE \`${schemas.accessToken}\` DROP COLUMN \`api_key_set_id\``,
    );
  }

  if (await knex.schema.hasTable(API_KEY_SET)) {
    if (await fkExists(knex, API_KEY_SET, 'api_key_set_user_id_user_id')) {
      await knex.schema.raw(
        `ALTER TABLE \`${API_KEY_SET}\` DROP FOREIGN KEY \`api_key_set_user_id_user_id\``,
      );
    }
    await knex.schema.dropTable(API_KEY_SET);
  }

  if (
    !await fkExists(knex, schemas.accessToken, 'access_token_user_id_user_id')
  ) {
    await knex.schema.raw(
      `ALTER TABLE \`${schemas.accessToken}\`
         ADD CONSTRAINT \`access_token_user_id_user_id\`
         FOREIGN KEY (\`user_id\`) REFERENCES \`${schemas.user}\` (\`id\`) ON DELETE CASCADE`,
    );
  }
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\` DROP FOREIGN KEY \`access_token_user_id_user_id\``,
  );

  await knex.schema.createTable(API_KEY_SET, (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('api_key');
    table.string('api_secret');
    table.integer('type');
    table.bigInteger('user_id').unsigned().notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw(
    `ALTER TABLE \`${API_KEY_SET}\`
       ADD CONSTRAINT \`api_key_set_user_id_user_id\`
       FOREIGN KEY (\`user_id\`) REFERENCES \`${schemas.user}\` (\`id\`) ON DELETE CASCADE`,
  );

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\`
       ADD COLUMN \`api_key_set_id\` BIGINT UNSIGNED NULL AFTER \`token\``,
  );

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\` MODIFY \`user_id\` BIGINT NULL`,
  );
}
