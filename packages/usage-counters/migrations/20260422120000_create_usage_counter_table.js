export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.usageCounter);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.usageCounter}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`actor_namespace\` varchar(20) DEFAULT NULL,
      \`actor_identifier\` bigint DEFAULT NULL,
      \`target_namespace\` varchar(20) DEFAULT NULL,
      \`begin\` datetime NOT NULL,
      \`end\` datetime NOT NULL,
      \`store\` longtext,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.usageCounter);
}
