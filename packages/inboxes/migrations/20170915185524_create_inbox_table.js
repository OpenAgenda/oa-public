exports.up = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.createTableIfNotExists( schemas.inbox, table => {
    table.charset( 'utf8' );
    table.collate( 'utf8_general_ci' );

    table.bigIncrements( 'id' ).unsigned().primary();
    table.string( 'type' ).notNullable();
    table.bigInteger( 'identifier' ).unsigned().notNullable();
  } );

};

exports.down = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.dropTableIfExists( schemas.inbox );

};
