exports.up = (knex) => {
  const { schemas } = knex.client.config;

  return knex(schemas.feed_activity).del();
};

exports.down = (_knex) => {
  //
};
