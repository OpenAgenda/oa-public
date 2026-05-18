export const up = (knex) => {
  const { schemas } = knex.client.config;

  return knex.schema.alterTable(schemas.activity, (t) => {
    t.index('target');
    t.index('object');
  });
};

export const down = (_knex) => {
  //
};
