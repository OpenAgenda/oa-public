exports.up = knex => {
  const schemas = knex.client.config.schemas;

  return knex(schemas.feed_notification).del();
};

exports.down = knex => {
  //
};
