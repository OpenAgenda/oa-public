exports.up = knex => {
  const schemas = knex.client.config.schemas;

  return knex(schemas.feed_activity).del();
};

exports.down = knex => {
  //
};
