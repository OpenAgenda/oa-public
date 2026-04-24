export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.apiKeySet);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.apiKeySet}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`api_key\` varchar(32) DEFAULT NULL,
      \`api_secret\` varchar(32) DEFAULT NULL,
      \`type\` bigint NOT NULL,
      \`user_id\` bigint DEFAULT NULL,
      \`application_id\` bigint DEFAULT NULL,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`id_idx\` (\`id\`),
      UNIQUE KEY \`api_key\` (\`api_key\`),
      UNIQUE KEY \`api_key_idx\` (\`api_key\`),
      KEY \`application_id_idx\` (\`application_id\`),
      KEY \`user_id_idx\` (\`user_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.apiKeySet);
}
