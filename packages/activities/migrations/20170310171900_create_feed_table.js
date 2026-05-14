export const up = async (knex) => {
  const { schemas } = knex.client.config;
  const exists = await knex.schema.hasTable(schemas.feed);

  if (exists) {
    return;
  }

  return knex.schema.createTable(schemas.feed, (table) => {
    table.bigIncrements('id').unsigned();
    table.enu('entity_type', ['user', 'agenda', 'event']).notNullable();
    table.bigInteger('entity_uid').unsigned().notNullable();
  });
};

export const down = (knex) => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.feed);
};
