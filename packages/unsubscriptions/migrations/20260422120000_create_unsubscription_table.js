export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.unsubscription);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.unsubscription}\` (
      \`id\` int unsigned NOT NULL AUTO_INCREMENT,
      \`email\` varchar(255) NOT NULL,
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.unsubscription);
}
