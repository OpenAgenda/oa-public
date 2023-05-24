'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`${schemas.rebuild_aggregator}\` (
      \`id\` bigint(20) NOT NULL AUTO_INCREMENT,
      \`review_id\` bigint(20) NOT NULL,
      \`created_at\` datetime NOT NULL,
      \`updated_at\` datetime NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`review_id_idx\` (\`review_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `);

  // Deletes ALL existing entries
  await knex(schemas.rebuild_aggregator).del();

  await knex(schemas.rebuild_aggregator).insert({
    "id": 1,
    "review_id": 7707,
    "created_at": "1970-01-01 00:00:00",
    "updated_at": "1970-01-01 00:00:00"
  });
};
