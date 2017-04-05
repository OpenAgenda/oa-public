exports.up = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.createTableIfNotExists( schemas.feed_follow, table => {
    table.bigIncrements( 'id' ).unsigned();
    table.bigInteger( 'origin_feed' ).unsigned();
    table.foreign( 'origin_feed' ).references( schemas.feed + '.id' ).onDelete( 'CASCADE' );
    table.bigInteger( 'target_feed' ).unsigned();
    table.foreign( 'target_feed' ).references( schemas.feed + '.id' ).onDelete( 'CASCADE' );
    table.text( 'store', 'longtext' );
  } );

};

exports.down = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.dropTableIfExists( schemas.feed_follow );

};
