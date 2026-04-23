export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.agenda);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.agenda}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`title\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`owner_id\` bigint NOT NULL,
      \`slug\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`description\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`image\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`url\` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`collaborative\` tinyint(1) NOT NULL DEFAULT '0',
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      \`deleted_at\` datetime DEFAULT NULL,
      \`uid\` bigint DEFAULT NULL,
      \`main\` tinyint(1) NOT NULL DEFAULT '0',
      \`store\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`contribution_type\` tinyint NOT NULL DEFAULT '0',
      \`contribution_info\` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`official\` tinyint(1) DEFAULT NULL,
      \`credentials\` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`settings\` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`private\` tinyint(1) NOT NULL DEFAULT '0',
      \`form_schema_id\` bigint DEFAULT NULL,
      \`officialized_at\` datetime DEFAULT NULL,
      \`indexed\` tinyint(1) DEFAULT '1',
      \`network_uid\` bigint DEFAULT NULL,
      \`location_set_uid\` bigint DEFAULT NULL,
      \`member_schema_id\` bigint DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`slug\` (\`slug\`),
      UNIQUE KEY \`uid\` (\`uid\`),
      KEY \`owner_id_idx\` (\`owner_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.agenda);
}
