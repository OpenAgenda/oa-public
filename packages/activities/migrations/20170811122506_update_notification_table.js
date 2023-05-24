exports.up = async knex => {

  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.feed_notification, t => {
    t.timestamp('updated_at').nullable().defaultTo(null);
  });

  const stream = knex(schemas.feed_notification)
    .whereNull('updated_at')
    .stream();

  for await (const item of stream) {
    console.log(`Update notification n°${item.id}: copy created_at in updated_at`);

    await knex.raw(`UPDATE \`${schemas.feed_notification}\`
                    SET updated_at = created_at
                    WHERE id = ?`, [item.id]);
  }

};

exports.down = knex => {
  //
};
