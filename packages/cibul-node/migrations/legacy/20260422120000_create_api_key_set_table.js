// Referenced by literal name, not `schemas.apiKeySet`: the api_key_set cutover
// removed that schema entry from config/index.js, so the indirection is now
// `undefined`. Same convention as 20260528170000_drop_api_key_set_table.js.
const API_KEY_SET = 'api_key_set';

export async function up(knex) {
  const exists = await knex.schema.hasTable(API_KEY_SET);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${API_KEY_SET}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`api_key\` varchar(32) DEFAULT NULL,
      \`api_secret\` varchar(32) DEFAULT NULL,
      \`type\` bigint NOT NULL,
      \`user_id\` bigint DEFAULT NULL,
      \`application_id\` bigint DEFAULT NULL,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`id_idx\` (\`id\`),
      UNIQUE KEY \`api_key\` (\`api_key\`),
      UNIQUE KEY \`api_key_idx\` (\`api_key\`),
      KEY \`application_id_idx\` (\`application_id\`),
      KEY \`user_id_idx\` (\`user_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
  `);
}

export function down(knex) {
  return knex.schema.dropTableIfExists(API_KEY_SET);
}
