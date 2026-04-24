'use strict';

exports.up = async (knex) => {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.location);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.location}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`slug\` varchar(100) NOT NULL,
      \`placename\` varchar(100) NOT NULL,
      \`address\` varchar(255) DEFAULT NULL,
      \`city\` varchar(100) DEFAULT NULL,
      \`country\` varchar(2) DEFAULT NULL,
      \`latitude\` decimal(10,6) NOT NULL,
      \`longitude\` decimal(10,6) NOT NULL,
      \`owner_id\` bigint DEFAULT NULL,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      \`main\` tinyint(1) NOT NULL DEFAULT '0',
      \`uid\` bigint DEFAULT NULL,
      \`store\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`processed_at\` datetime DEFAULT NULL,
      \`department\` varchar(255) DEFAULT NULL,
      \`region\` varchar(255) DEFAULT NULL,
      \`city_district\` varchar(255) DEFAULT NULL,
      \`postal_code\` varchar(20) DEFAULT NULL,
      \`eve_id\` varchar(100) DEFAULT NULL,
      \`agenda_id\` bigint DEFAULT NULL,
      \`insee\` varchar(10) DEFAULT NULL,
      \`set_uid\` bigint DEFAULT NULL,
      \`ext_id\` varchar(100) DEFAULT NULL,
      \`deleted\` tinyint(1) NOT NULL DEFAULT '0',
      \`duplicates\` varchar(2000) DEFAULT NULL,
      \`merged_in\` bigint DEFAULT NULL,
      \`admin_level_3\` varchar(255) DEFAULT NULL,
      \`admin_level_5\` varchar(255) DEFAULT NULL,
      \`duplicate_candidates\` varchar(1000) DEFAULT NULL,
      \`duplicate_disqualified\` varchar(1000) DEFAULT NULL,
      \`ext_ids\` json DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`slug\` (\`slug\`),
      UNIQUE KEY \`slug_idx\` (\`slug\`),
      UNIQUE KEY \`uid\` (\`uid\`),
      KEY \`owner_id_idx\` (\`owner_id\`),
      KEY \`agenda_id_idx\` (\`agenda_id\`),
      KEY \`set_uid_idx\` (\`set_uid\`),
      KEY \`ext_id_idx\` (\`ext_id\`),
      KEY \`deleted_idx\` (\`deleted\`),
      KEY \`lat_idx\` (\`latitude\`),
      KEY \`lng_idx\` (\`longitude\`),
      KEY \`location_duplicate_candidates_index\` (\`duplicate_candidates\`),
      KEY \`created_at_idx\` (\`created_at\`),
      KEY \`updated_at_idx\` (\`updated_at\`),
      KEY \`ext_ids_idx\` ((CAST(JSON_EXTRACT(\`ext_ids\`, _utf8mb4'$.identifiers') AS CHAR(255) ARRAY)))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
  `);
};

exports.down = (knex) => {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.location);
};
