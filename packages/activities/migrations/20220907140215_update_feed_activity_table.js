export const up = (knex) => {
  const { schemas } = knex.client.config;

  return knex(schemas.feed_activity).del();
};

export const down = (_knex) => {
  //
};
