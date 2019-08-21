'use strict';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable( schemas.user );

  if ( !exists ) {
    await knex.schema.raw(
      `CREATE TABLE \`${schemas.user}\` (
        \`id\` bigint(20) NOT NULL,
        \`full_name\` varchar(50) DEFAULT NULL,
        \`username\` varchar(50) DEFAULT NULL,
        \`email\` varchar(255) DEFAULT NULL,
        \`image\` varchar(255) DEFAULT NULL,
        \`facebook_uid\` varchar(255) DEFAULT NULL,
        \`twitter_screen_name\` varchar(255) DEFAULT NULL,
        \`culture\` varchar(5) DEFAULT NULL,
        \`is_activated\` tinyint(1) DEFAULT '0',
        \`main\` varchar(2) DEFAULT NULL,
        \`password\` varchar(40) DEFAULT NULL,
        \`salt\` varchar(32) NOT NULL,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NOT NULL,
        \`last_notified\` datetime DEFAULT NULL,
        \`is_removed\` tinyint(1) NOT NULL DEFAULT '0',
        \`store\` longtext,
        \`api_key\` varchar(32) DEFAULT NULL,
        \`reply_token\` varchar(255) DEFAULT NULL,
        \`is_basic\` tinyint(1) NOT NULL DEFAULT '0',
        \`twitter_id\` varchar(255) DEFAULT NULL,
        \`google_id\` varchar(255) DEFAULT NULL,
        \`uid\` bigint(20) DEFAULT NULL,
        \`last_signin\` datetime DEFAULT NULL,
        \`comexposium_id\` varchar(255) DEFAULT NULL,
        \`is_new\` tinyint(4) DEFAULT '1',
        \`last_inbox_check\` datetime DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    ` );

    await knex.raw( `
      ALTER TABLE \`${schemas.user}\`
      ADD PRIMARY KEY (\`id\`),
      ADD UNIQUE KEY \`id_idx\` (\`id\`),
      ADD UNIQUE KEY \`username\` (\`username\`),
      ADD UNIQUE KEY \`email\` (\`email\`),
      ADD UNIQUE KEY \`email_idx\` (\`email\`),
      ADD UNIQUE KEY \`uid\` (\`uid\`),
      ADD UNIQUE KEY \`reply_token\` (\`reply_token\`);
    ` );

    await knex.raw( `
      ALTER TABLE \`${schemas.user}\`
      MODIFY \`id\` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91514;
    ` );
  }
};

exports.down = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists( schemas.user );
};
