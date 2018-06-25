exports.up = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.createTableIfNotExists( schemas.key, table => {
    table.bigIncrements( 'id' ).unsigned().primary();
    table.string( 'type' ).notNullable();
    table.bigInteger( 'identifier' ).unsigned().notNullable().index();
    table.string( 'label' );
    table.string( 'key' ).notNullable().index();
    table.timestamp( 'created_at' ).notNullable().defaultTo( knex.fn.now() );
  } );

};

exports.down = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.dropTableIfExists( schemas.key );

};
