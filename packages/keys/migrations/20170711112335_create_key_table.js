export async function up(knex) {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable(schemas.key);

  if (exists) {
    return;
  }

  return knex.schema.createTable(schemas.key, (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('type').notNullable();
    table.bigInteger('identifier').unsigned().notNullable().index();
    table.string('label');
    table.string('key').notNullable().index();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.key);
}
