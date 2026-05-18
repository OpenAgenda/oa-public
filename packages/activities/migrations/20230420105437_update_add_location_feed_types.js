export const up = (knex) => {
  const { schemas } = knex.client.config;

  return knex.schema.alterTable(schemas.feed, (t) => {
    t.enu('entity_type', ['user', 'agenda', 'event', 'location', 'locationSet'])
      .notNullable()
      .alter();
  });
};

export const down = (_knex) => {
  //
};
