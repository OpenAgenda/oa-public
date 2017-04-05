exports.up = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.createTableIfNotExists( schemas.feed_activity, table => {
    table.bigInteger( 'feed_id' ).unsigned().notNullable();
    table.foreign( 'feed_id' ).references( schemas.feed + '.id' ).onDelete( 'CASCADE' );
    table.bigInteger( 'activity_id' ).unsigned().notNullable();
    table.foreign( 'activity_id' ).references( schemas.activity + '.id' ).onDelete( 'CASCADE' );
  } );

};

exports.down = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.dropTableIfExists( schemas.feed_activity );

};
