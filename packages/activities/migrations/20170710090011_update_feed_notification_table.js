export const up = (knex) => {
  const { schemas } = knex.client.config;

  return knex.schema.alterTable(schemas.feed_notification, (t) => {
    // ALTER TABLE `activity_feed_notification` CHANGE `group_by` `group_by` TEXT(2048) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL
    t.string('group_by', 768).alter();
    t.index(['verb', 'group_by']);
  });
};

export const down = (_knex) => {
  //
};
