export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.agendaEvent);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.agendaEvent}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`agenda_uid\` bigint NOT NULL,
      \`event_uid\` bigint NOT NULL,
      \`state\` tinyint(1) NOT NULL DEFAULT '0',
      \`featured\` tinyint(1) NOT NULL DEFAULT '0',
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      \`legacy_id\` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`user_uid\` bigint DEFAULT NULL,
      \`can_edit\` tinyint DEFAULT '0',
      \`source_agenda_uid\` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`aggregated\` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      \`motive\` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
      \`removed\` tinyint(1) NOT NULL DEFAULT '0',
      PRIMARY KEY (\`id\`),
      KEY \`agenda_uid_idx\` (\`agenda_uid\`),
      KEY \`event_uid_idx\` (\`event_uid\`),
      KEY \`legacy_id_idx\` (\`legacy_id\`),
      KEY \`user_uid\` (\`user_uid\`),
      KEY \`aggregated_idx\` (\`aggregated\`),
      KEY \`removed_idx\` (\`removed\`),
      KEY \`agenda_uid_event_uid_idx\` (\`agenda_uid\`,\`event_uid\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export function down(knex) {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.agendaEvent);
}
