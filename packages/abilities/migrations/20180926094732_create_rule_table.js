'use strict';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  const exists = await knex.schema.hasTable( schemas.rule );

  if ( !exists ) {
    return knex.schema.createTable( schemas.rule, table => {
      table.charset( 'utf8' );
      table.collate( 'utf8_general_ci' );

      table
        .bigIncrements( 'id' )
        .unsigned()
        .primary();
      table
        .string( 'entity_name' )
        .notNullable()
        .index();
      table
        .bigInteger( 'identifier' )
        .unsigned()
        .notNullable()
        .index();

      table.string( 'actions' );
      table.string( 'subject' );
      table.boolean( 'inverted' ).defaultTo( false );
      table.text( 'conditions', 'longtext' );
      table.text( 'fields', 'longtext' );
      table.text( 'reason', 'longtext' );
    } );
  }
};

exports.down = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists( schemas.rule );
};
