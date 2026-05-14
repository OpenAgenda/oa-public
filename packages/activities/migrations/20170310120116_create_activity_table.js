export const up = async (knex) => {
  const { schemas } = knex.client.config;
  const exists = await knex.schema.hasTable(schemas.activity);

  if (exists) {
    return;
  }

  return knex.schema.createTable(schemas.activity, (table) => {
    table.bigIncrements('id').unsigned();
    table.string('actor').notNullable();
    table.string('verb').notNullable();
    table.string('object').notNullable();
    table.string('target');
    table.text('store', 'longtext');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
  });
};

export const down = (knex) => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.activity);
};
