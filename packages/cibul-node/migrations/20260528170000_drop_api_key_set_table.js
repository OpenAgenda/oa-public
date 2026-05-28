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

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\` MODIFY \`user_id\` BIGINT UNSIGNED NOT NULL`,
  );

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\` DROP COLUMN \`api_key_set_id\``,
  );

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.apiKeySet}\` DROP FOREIGN KEY \`api_key_set_user_id_user_id\``,
  );

  await knex.schema.dropTableIfExists(schemas.apiKeySet);

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\`
       ADD CONSTRAINT \`access_token_user_id_user_id\`
       FOREIGN KEY (\`user_id\`) REFERENCES \`${schemas.user}\` (\`id\`) ON DELETE CASCADE`,
  );
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\` DROP FOREIGN KEY \`access_token_user_id_user_id\``,
  );

  await knex.schema.createTable(schemas.apiKeySet, (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('api_key');
    table.string('api_secret');
    table.integer('type');
    table.bigInteger('user_id').unsigned().notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.apiKeySet}\`
       ADD CONSTRAINT \`api_key_set_user_id_user_id\`
       FOREIGN KEY (\`user_id\`) REFERENCES \`${schemas.user}\` (\`id\`) ON DELETE CASCADE`,
  );

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\`
       ADD COLUMN \`api_key_set_id\` BIGINT UNSIGNED NULL AFTER \`token\``,
  );

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\` MODIFY \`user_id\` BIGINT UNSIGNED NULL`,
  );
}
