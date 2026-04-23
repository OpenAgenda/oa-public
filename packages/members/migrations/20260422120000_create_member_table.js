export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.stakeholder);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.stakeholder}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`user_id\` bigint DEFAULT NULL,
      \`review_id\` bigint DEFAULT NULL,
      \`credential\` bigint NOT NULL,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      \`store\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
      \`organization\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      \`creator_id\` bigint DEFAULT NULL,
      \`deleted_user\` tinyint(1) DEFAULT '0',
      \`actions_counter\` int DEFAULT '0',
      \`agenda_uid\` bigint DEFAULT NULL,
      \`user_uid\` bigint DEFAULT NULL,
      \`slug\` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`user_id_idx\` (\`user_id\`),
      KEY \`review_id_idx\` (\`review_id\`),
      KEY \`user_uid_idx\` (\`user_uid\`),
      KEY \`agenda_uid_idx\` (\`agenda_uid\`),
      KEY \`slug_idx\` (\`slug\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.stakeholder);
}
