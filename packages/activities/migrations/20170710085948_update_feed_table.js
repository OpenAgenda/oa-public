exports.up = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.alterTable( schemas.feed, t => {
    t.index( [ 'entity_type', 'entity_uid' ] );
  } );

};

exports.down = knex => {

  //

};
