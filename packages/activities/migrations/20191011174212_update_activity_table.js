exports.up = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.alterTable( schemas.activity, t => {
    t.index( 'target' );
    t.index( 'object' );
  } );

};

exports.down = knex => {

  //

};
