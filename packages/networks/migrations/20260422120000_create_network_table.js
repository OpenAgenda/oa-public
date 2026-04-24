export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.network);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.network}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`uid\` bigint NOT NULL,
      \`title\` varchar(255) DEFAULT NULL,
      \`form_schema_id\` bigint DEFAULT NULL,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uid\` (\`uid\`),
      KEY \`id_idx\` (\`id\`),
      KEY \`uid_idx\` (\`uid\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.network);
}
