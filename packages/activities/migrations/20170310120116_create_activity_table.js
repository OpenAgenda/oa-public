exports.up = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.createTableIfNotExists( schemas.activity, table => {
    table.bigIncrements( 'id' );
    table.string( 'actor' ).notNullable();
    table.string( 'verb' ).notNullable();
    table.string( 'object' ).notNullable();
    table.text( 'store', 'longtext' );
    table.dateTime( 'created_at' ).notNullable().defaultTo( knex.fn.now() );
    table.dateTime( 'updated_at' );
  } );

};

exports.down = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.dropTableIfExists( schemas.activity );

};
