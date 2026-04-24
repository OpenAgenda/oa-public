export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.aggregator);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.aggregator}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`review_id\` bigint NOT NULL,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      \`store\` longtext,
      \`version\` tinyint(1) DEFAULT NULL,
      \`limit\` int DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`review_id_idx\` (\`review_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.aggregator);
}
