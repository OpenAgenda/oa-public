export async function up(knex) {
  const { schemas } = knex.client.config;
  await knex.schema.raw(
    `ALTER TABLE \`${schemas.conversation}\`
       CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await knex.schema.raw(
    `ALTER TABLE \`${schemas.conversation}\`
       MODIFY COLUMN \`type\`             varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
       MODIFY COLUMN \`type_identifier\`  varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
       MODIFY COLUMN \`store\`            longtext     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
       MODIFY COLUMN \`file_key\`         varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL`,
  );
}

export async function down(knex) {
  const { schemas } = knex.client.config;
  await knex.schema.raw(
    `ALTER TABLE \`${schemas.conversation}\` CONVERT TO CHARACTER SET utf8mb3`,
  );
}
