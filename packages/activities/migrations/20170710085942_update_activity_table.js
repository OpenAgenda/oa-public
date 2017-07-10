exports.up = knex => {

  const schemas = knex.client.config.schemas;

  return knex.schema.alterTable( schemas.activity, t => {
    t.index( 'actor' );
  } );

};

exports.down = knex => {

  //

};
