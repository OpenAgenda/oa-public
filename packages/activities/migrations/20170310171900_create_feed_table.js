exports.up = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.createTableIfNotExists( schemas.feed, table => {
    table.bigIncrements( 'id' ).unsigned();
    table.enu( 'entity_type', [ 'user', 'agenda', 'event' ] ).notNullable();
    table.bigInteger( 'entity_uid' ).unsigned().notNullable();
  } );

};

exports.down = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.dropTableIfExists( schemas.feed );

};
