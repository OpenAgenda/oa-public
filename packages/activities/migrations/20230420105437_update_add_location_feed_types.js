exports.up = knex => {
  const schemas = knex.client.config.schemas;

  return knex.schema.alterTable(schemas.feed, t => {
    t.enu('entity_type', ['user', 'agenda', 'event', 'location', 'locationSet']).notNullable().alter();
  });
};

exports.down = knex => {
  //
};
