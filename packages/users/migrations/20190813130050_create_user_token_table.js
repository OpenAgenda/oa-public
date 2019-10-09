'use strict';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.userToken);

  if (!exists) {
    await knex.schema.raw(
      `CREATE TABLE \`${schemas.userToken}\` (
        \`id\` bigint(20) NOT NULL,
        \`token\` varchar(40) NOT NULL,
        \`type\` varchar(2) NOT NULL,
        \`email\` varchar(50) DEFAULT NULL,
        \`user_id\` bigint(20) DEFAULT NULL,
        \`password\` varchar(50) DEFAULT NULL,
        \`salt\` varchar(32) DEFAULT NULL,
        \`facebook_uid\` varchar(255) DEFAULT NULL,
        \`twitter_screen_name\` varchar(255) DEFAULT NULL,
        \`full_name\` varchar(50) DEFAULT NULL,
        \`username\` varchar(50) DEFAULT NULL,
        \`image\` varchar(255) DEFAULT NULL,
        \`store\` longtext
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
    `
    );

    await knex.raw(`
      ALTER TABLE \`${schemas.userToken}\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`user_id_idx\` (\`user_id\`);
    `);

    await knex.raw(`
      ALTER TABLE \`${schemas.userToken}\`
      MODIFY \`id\` bigint(20) NOT NULL AUTO_INCREMENT;
    `);

    await knex.raw(`
      ALTER TABLE \`${schemas.userToken}\`
      ADD CONSTRAINT \`user_token_user_id_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`${schemas.user}\` (\`id\`);
    `);
  }
};

exports.down = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.userToken);
};
