export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.unsubscriptionLink);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.unsubscriptionLink}\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`token\` varchar(36) NOT NULL,
      \`target\` text NOT NULL,
      \`rule\` text NOT NULL,
      \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`processed_at\` timestamp NULL DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`token\` (\`token\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.unsubscriptionLink);
}
