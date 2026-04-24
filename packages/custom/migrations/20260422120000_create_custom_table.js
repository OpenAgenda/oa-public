export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.custom);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.custom}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`form_schema_id\` bigint NOT NULL,
      \`identifier\` bigint NOT NULL,
      \`store\` mediumtext NOT NULL,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`identifier_idx\` (\`identifier\`),
      KEY \`form_schema_id_identifier_idx\` (\`form_schema_id\`,\`identifier\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.custom);
}
