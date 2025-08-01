'use strict';

exports.up = async (knex) => {
  const { schemas } = knex.client.config;

  const [indexes] = await knex.raw(
    `SHOW INDEXES FROM ${schemas.feed_activity};`,
  );

  const activityIdIndex = indexes.find(
    (index) => index.Key_name === 'activity_id',
  );

  if (activityIdIndex) {
    await knex.schema.raw(
      `ALTER TABLE ${schemas.feed_activity} DROP INDEX activity_id, ADD INDEX idx_feedid_activityid (feed_id DESC, activity_id DESC)`,
    );
  } else {
    await knex.schema.raw(
      `ALTER TABLE ${schemas.feed_activity} ADD INDEX idx_feedid_activityid (feed_id DESC, activity_id DESC)`,
    );
  }

  await knex.schema.raw(
    `DROP INDEX activity_feed_activity_feed_id_foreign ON ${schemas.feed_activity}`,
  );
};

exports.down = async (_knex) => {
  //
};
