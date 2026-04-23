'use strict';

exports.up = async (knex) => {
  // activity: utf8mb4 / unicode_ci with explicit per-column charset.
  await knex.schema.raw(
    `ALTER TABLE \`activity\`
       CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await knex.schema.raw(
    `ALTER TABLE \`activity\`
       MODIFY COLUMN \`actor\`  varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
       MODIFY COLUMN \`verb\`   varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
       MODIFY COLUMN \`target\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
       MODIFY COLUMN \`store\`  longtext     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
       MODIFY COLUMN \`detail\` longtext     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );

  // activity_feed_notification: utf8mb4 / unicode_ci + composite index on feed_id.
  // group_by(255) prefix is required: utf8mb4 × 768 > max key length 3072 bytes.
  await knex.schema.raw(
    'ALTER TABLE `activity_feed_notification` DROP INDEX `activity_feed_notification_verb_group_by_index`',
  );
  await knex.schema.raw(
    `ALTER TABLE \`activity_feed_notification\`
       CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await knex.schema.raw(
    `ALTER TABLE \`activity_feed_notification\`
       MODIFY COLUMN \`verb\`     varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
       MODIFY COLUMN \`group_by\` varchar(768) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
       MODIFY COLUMN \`store\`    longtext     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await knex.schema.raw(
    'ALTER TABLE `activity_feed_notification` ADD KEY `feed_id_updated_at_id_idx` (`feed_id`, `updated_at` DESC, `id` DESC)',
  );
  await knex.schema.raw(
    'ALTER TABLE `activity_feed_notification` ADD KEY `activity_feed_notification_verb_group_by_index` (`verb`, `group_by`(255))',
  );
};

exports.down = async (knex) => {
  await knex.schema.raw(
    'ALTER TABLE `activity_feed_notification` DROP INDEX `activity_feed_notification_verb_group_by_index`',
  );
  await knex.schema.raw(
    'ALTER TABLE `activity_feed_notification` DROP INDEX `feed_id_updated_at_id_idx`',
  );
  await knex.schema.raw(
    'ALTER TABLE `activity_feed_notification` ADD KEY `activity_feed_notification_verb_group_by_index` (`verb`, `group_by`)',
  );
  await knex.schema.raw(
    'ALTER TABLE `activity_feed_notification` ADD KEY `activity_feed_notification_feed_id_foreign` (`feed_id`)',
  );
  await knex.schema.raw(
    'ALTER TABLE `activity_feed_notification` CONVERT TO CHARACTER SET utf8mb3',
  );

  await knex.schema.raw(
    'ALTER TABLE `activity` CONVERT TO CHARACTER SET utf8mb3',
  );
};
