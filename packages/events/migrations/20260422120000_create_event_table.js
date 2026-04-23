export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.eventService);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.eventService}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`uid\` bigint DEFAULT NULL,
      \`owner_uid\` bigint DEFAULT NULL,
      \`creator_uid\` bigint DEFAULT NULL,
      \`agenda_uid\` bigint DEFAULT NULL,
      \`location_uid\` bigint DEFAULT NULL,
      \`ext_ids\` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`slug\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      \`title\` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`description\` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`long_description\` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`keywords\` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`conditions\` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`image\` varchar(1500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`draft\` tinyint(1) DEFAULT '0',
      \`private\` tinyint(1) DEFAULT '0',
      \`timezone\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`timings\` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`accessibility\` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`age\` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`registration\` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      \`deleted_at\` datetime DEFAULT NULL,
      \`file_key\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`references\` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`links\` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`event_attendance_mode\` tinyint(1) DEFAULT '1',
      \`online_access_link\` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`attendance_mode\` tinyint(1) DEFAULT '1',
      \`status\` tinyint(1) NOT NULL DEFAULT '1',
      UNIQUE KEY \`id_idx\` (\`id\`),
      UNIQUE KEY \`slug_idx\` (\`slug\`),
      UNIQUE KEY \`uid_idx\` (\`uid\`),
      KEY \`agenda_uid_idx\` (\`agenda_uid\`),
      KEY \`location_uid_idx\` (\`location_uid\`),
      KEY \`owner_uid_idx\` (\`owner_uid\`),
      KEY \`updated_at_idx\` (\`updated_at\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.eventService);
}
