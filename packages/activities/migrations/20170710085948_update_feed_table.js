export const up = (knex) => {
  const { schemas } = knex.client.config;

  return knex.schema.alterTable(schemas.feed, (t) => {
    t.index(['entity_type', 'entity_uid']);
  });
};

export const down = (_knex) => {
  //
};
