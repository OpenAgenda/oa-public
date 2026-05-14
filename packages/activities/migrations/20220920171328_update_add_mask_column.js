export const up = (knex) => {
  const { schemas } = knex.client.config;

  return knex.schema.alterTable(schemas.feed_activity, (t) => {
    t.text('mask', 'longtext').nullable();
  });
};

export const down = (_knex) => {
  //
};
