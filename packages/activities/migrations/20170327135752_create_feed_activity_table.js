export const up = async (knex) => {
  const { schemas } = knex.client.config;
  const exists = await knex.schema.hasTable(schemas.feed_activity);

  if (exists) {
    return;
  }

  return knex.schema.createTable(schemas.feed_activity, (table) => {
    table.bigInteger('feed_id').unsigned().notNullable();
    table
      .foreign('feed_id')
      .references(`${schemas.feed}.id`)
      .onDelete('CASCADE');
    table.bigInteger('activity_id').unsigned().notNullable();
    table
      .foreign('activity_id')
      .references(`${schemas.activity}.id`)
      .onDelete('CASCADE');
  });
};

export const down = (knex) => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.feed_activity);
};
