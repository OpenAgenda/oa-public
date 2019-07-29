exports.up = async knex => {

  const schemas = knex.client.config.schemas;
  const exists = await knex.schema.hasTable( schemas.feed_notification );

  if ( exists ) {
    return;
  }

  return knex.schema.createTable( schemas.feed_notification, table => {
    table.bigIncrements( 'id' ).unsigned();
    table.bigInteger( 'feed_id' ).unsigned().notNullable();
    table.foreign( 'feed_id' ).references( schemas.feed + '.id' ).onDelete( 'CASCADE' );
    table.string( 'verb' ).notNullable();
    table.text( 'group_by' );
    table.text( 'store', 'longtext' );
    table.tinyint( 'state' ).defaultTo( 0 );
    table.tinyint( 'sent' ).defaultTo( 0 );
    table.timestamp( 'created_at' ).notNullable().defaultTo( knex.fn.now() );
  } );

};

exports.down = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.dropTableIfExists( schemas.feed_notification );

};
