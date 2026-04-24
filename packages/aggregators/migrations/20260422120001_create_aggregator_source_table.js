export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.aggregatorSource);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.aggregatorSource}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`aggregator_id\` bigint NOT NULL,
      \`review_id\` bigint NOT NULL,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      \`store\` longtext,
      PRIMARY KEY (\`id\`),
      KEY \`aggregator_id_idx\` (\`aggregator_id\`),
      KEY \`review_id_idx\` (\`review_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.aggregatorSource);
}
