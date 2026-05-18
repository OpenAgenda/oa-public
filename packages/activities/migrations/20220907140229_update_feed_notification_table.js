export const up = (knex) => {
  const { schemas } = knex.client.config;

  return knex(schemas.feed_notification).del();
};

export const down = (_knex) => {
  //
};
