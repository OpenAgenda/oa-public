'use strict';

const adminUids = [75052324, 99999999, 31046551, 7339049, 71438739];

exports.up = async knex => {
  const { schemas } = knex.client.config;

  const insertedId = await knex(schemas.inbox).insert({
    type: 'support',
    identifier: 1
  });

  await knex(schemas.inboxUser).insert(
    adminUids.map(v => ({
      inbox_id: insertedId,
      user_uid: v
    }))
  );
};

exports.down = async knex => {
  const { schemas } = knex.client.config;

  await knex(schemas.inbox)
    .del()
    .where({
      type: 'support',
      identifier: 1
    });
};
