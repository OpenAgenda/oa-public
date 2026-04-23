export async function up(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.agenda}\`
       ADD CONSTRAINT \`review_owner_id_user_id\`
       FOREIGN KEY (\`owner_id\`) REFERENCES \`${schemas.user}\` (\`id\`)`,
  );

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.apiKeySet}\`
       ADD CONSTRAINT \`api_key_set_user_id_user_id\`
       FOREIGN KEY (\`user_id\`) REFERENCES \`${schemas.user}\` (\`id\`) ON DELETE CASCADE`,
  );

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\`
       ADD CONSTRAINT \`access_token_api_key_set_id_api_key_set_id\`
       FOREIGN KEY (\`api_key_set_id\`) REFERENCES \`${schemas.apiKeySet}\` (\`id\`) ON DELETE CASCADE`,
  );

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.aggregator}\`
       ADD CONSTRAINT \`aggregator_review_id_review_id\`
       FOREIGN KEY (\`review_id\`) REFERENCES \`${schemas.agenda}\` (\`id\`) ON DELETE CASCADE`,
  );

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.aggregatorSource}\`
       ADD CONSTRAINT \`aggregator_source_aggregator_id_aggregator_id\`
       FOREIGN KEY (\`aggregator_id\`) REFERENCES \`${schemas.aggregator}\` (\`id\`) ON DELETE CASCADE,
       ADD CONSTRAINT \`aggregator_source_review_id_review_id\`
       FOREIGN KEY (\`review_id\`) REFERENCES \`${schemas.agenda}\` (\`id\`) ON DELETE CASCADE`,
  );

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.location}\`
       ADD CONSTRAINT \`location_owner_id_user_id\`
       FOREIGN KEY (\`owner_id\`) REFERENCES \`${schemas.user}\` (\`id\`)`,
  );
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.location}\` DROP FOREIGN KEY \`location_owner_id_user_id\``,
  );
  await knex.schema.raw(
    `ALTER TABLE \`${schemas.aggregatorSource}\` DROP FOREIGN KEY \`aggregator_source_review_id_review_id\``,
  );
  await knex.schema.raw(
    `ALTER TABLE \`${schemas.aggregatorSource}\` DROP FOREIGN KEY \`aggregator_source_aggregator_id_aggregator_id\``,
  );
  await knex.schema.raw(
    `ALTER TABLE \`${schemas.aggregator}\` DROP FOREIGN KEY \`aggregator_review_id_review_id\``,
  );
  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\` DROP FOREIGN KEY \`access_token_api_key_set_id_api_key_set_id\``,
  );
  await knex.schema.raw(
    `ALTER TABLE \`${schemas.apiKeySet}\` DROP FOREIGN KEY \`api_key_set_user_id_user_id\``,
  );
  await knex.schema.raw(
    `ALTER TABLE \`${schemas.agenda}\` DROP FOREIGN KEY \`review_owner_id_user_id\``,
  );
}
