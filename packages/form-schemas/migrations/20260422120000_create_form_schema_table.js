export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.formSchema);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.formSchema}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`store\` longtext,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`id_idx\` (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.formSchema);
}
