import uuid from 'uuid/v4.js';

export async function up(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.conversation, (t) => {
    t.string('file_key').notNullable();
  });

  let convs;

  while (
    (convs = await knex(schemas.conversation).select().where({ file_key: '' }))
  ) {
    if (!convs.length) break;

    for (const conv of convs) {
      await knex(schemas.conversation)
        .where({ id: conv.id })
        .update({ file_key: uuid().replace(/-/g, '') });
    }
  }

  await knex.schema.alterTable(schemas.conversation, (t) => {
    t.string('file_key').unique().alter();
  });
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.conversation, (t) => {
    t.dropColumn('file_key');
  });
}
