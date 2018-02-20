exports.up = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.createTableIfNotExists( schemas.activity, table => {
    table.bigIncrements( 'id' ).unsigned();
    table.string( 'actor' ).notNullable();
    table.string( 'verb' ).notNullable();
    table.string( 'object' ).notNullable();
    table.string( 'target' );
    table.text( 'store', 'longtext' );
    table.timestamp( 'created_at' ).notNullable().defaultTo( knex.fn.now() );
    table.timestamp( 'updated_at' );
  } );

};

exports.down = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.dropTableIfExists( schemas.activity );

};
