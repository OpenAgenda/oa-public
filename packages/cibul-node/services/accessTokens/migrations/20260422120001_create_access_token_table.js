export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.accessToken);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.accessToken}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`token\` varchar(32) DEFAULT NULL,
      \`lifespan\` bigint NOT NULL,
      \`api_key_set_id\` bigint NOT NULL,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`id_idx\` (\`id\`),
      UNIQUE KEY \`token\` (\`token\`),
      UNIQUE KEY \`token_idx\` (\`token\`),
      KEY \`api_key_set_id_idx\` (\`api_key_set_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.accessToken);
}
