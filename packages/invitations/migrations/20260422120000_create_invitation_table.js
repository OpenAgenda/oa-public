export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.invitation);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.invitation}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`email\` varchar(255) NOT NULL,
      \`token\` varchar(255) NOT NULL,
      \`store\` longtext,
      \`processedAt\` datetime DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`token\` (\`token\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.invitation);
}
