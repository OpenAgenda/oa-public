'use strict';

exports.up = async (knex) => {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.locationSet);
  if (exists) return;

  await knex.schema.raw(`
    CREATE TABLE \`${schemas.locationSet}\` (
      \`id\` bigint NOT NULL AUTO_INCREMENT,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      \`uid\` bigint DEFAULT NULL,
      \`title\` varchar(255) DEFAULT NULL,
      \`settings\` text,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uid\` (\`uid\`),
      UNIQUE KEY \`uid_idx\` (\`uid\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
  `);
};

exports.down = (knex) => {
  const { schemas } = knex.client.config;
  return knex.schema.dropTableIfExists(schemas.locationSet);
};
