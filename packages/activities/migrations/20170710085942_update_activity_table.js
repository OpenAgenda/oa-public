exports.up = (knex) => {
  const { schemas } = knex.client.config;

  return knex.schema.alterTable(schemas.activity, (t) => {
    t.index('actor');
  });
};

exports.down = (_knex) => {
  //
};
